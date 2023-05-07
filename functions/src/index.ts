import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import fetch from 'node-fetch';

const app = express();
admin.initializeApp();

const validateFirebaseIdToken = async (req: any, res: any, next: any) => {
  functions.logger.log('Check if request is authorized with Firebase ID token');

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
      !(req.cookies && req.cookies.__session)) {
    functions.logger.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.'
    );
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    functions.logger.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    functions.logger.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    functions.logger.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    functions.logger.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
    return;
  }
};

const ROOM_COLLECTION = 'Room';
const TENANT_COLLECTION = 'Tenant';
const ACTIVE_PAYMENT_COLLECTION = 'ActivePaymentSessions';

// TODO paste your secret here, also this can be saved in firestore
const PAYMONGO_SECRET = 'sk_test_uDLWbhz9AwSXP9vmyDqLLAVp'; // TODO secure this

app.use(cors({ origin: true}));
app.use(cookieParser());
app.use(validateFirebaseIdToken);
app.use('/',
  async (request, response) => {
    functions.logger.info('payment session start', request);
    if (request.method !== 'POST') {
      functions.logger.info('invalid request');
      response.sendStatus(400);
      return;
    }

    try {
      functions.logger.log('req:', request);

      // type: bedspace-reservation, room-reservation, monthly-rent
      const { roomId, lineItems, type } = request.body;
      const url = 'https://api.paymongo.com/v1/checkout_sessions';
      const room = (await admin.firestore().collection(ROOM_COLLECTION).doc(roomId).get()).data();

      // make sure room or bed is not occupied
      if (type === 'bedspace-reservation' && room) {
          room.Beds.forEach((bed: any) => {
            const bedFromLineItems = lineItems.find((item: any) => item.uid === bed.uid);
            if (bedFromLineItems && bedFromLineItems.occupied) {
              response.send({
                error: 'Bed already occupied',
              });
              return;
            }
        });
      } else if (type === 'room-reservation' && room) {
        if (room.occupied) {
          response.send({
            error: 'Room already occupied',
          });
          return;
        }
      }
      // TODO handle other types

      // return to room page
      functions.logger.log('request headers', request.headers);
      const roomUrl = `${request.headers.origin}/room/${roomId}`;
      functions.logger.log('roomUrl', roomUrl);

      const options = {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': `Basic ${Buffer.from(`${PAYMONGO_SECRET}:`).toString('base64')}`
          //'authorization': `Basic c2tfdGVzdF91RExXYmh6OUF3U1hQOXZteURxTExBVnA6` remove
        },
        body: JSON.stringify({
          data: {
            attributes: {
              description: room?.Title || 'Spot-A-Home Payment',
              // line_items: [
              //   {
              //     amount: 200000, // amount in centavo
              //     currency: 'PHP',
              //     // description: 'test bh',
              //     // images: ['string'],
              //     name: 'Bed space up',
              //     quantity: 1,
              //   }
              // ],
              // reference_number: 'string',
              // statement_descriptor: 'string',

              line_items: lineItems.map((item: any) => ({
                amount: Math.round(parseFloat(item.amount) * 100), // converts to centavo
                currency: 'PHP',
                name: item.name,
                quantity: 1,
              })),

              success_url: roomUrl,
              cancel_url: roomUrl,

              payment_method_types: ['gcash', 'paymaya', 'grab_pay', 'card', 'dob', 'dob_ubp'],
              send_email_receipt: false,
              show_description: true,
              show_line_items: true,
            }
          }
        })
      };

      const paymongoResponse = await fetch(url, options);
      functions.logger.log('pres:', paymongoResponse);

      const paymongoResponseJson = await paymongoResponse.json();

      const checkoutUrl = paymongoResponseJson.data.attributes.checkout_url;
      const checkoutSessionId = paymongoResponseJson.data.id;
      const paymentIntentId = paymongoResponseJson.data.attributes.payment_intent.id;
      const userId = (request as any).user.uid;

      // create active payment session
      await admin.firestore().collection(ACTIVE_PAYMENT_COLLECTION).doc(paymentIntentId).set({
        status: 'pending',
        roomId,
        checkoutUrl,
        lineItems,
        userId,
        type,
        checkoutSessionId,
        dateCreated: Date.now(),
      });

      const tenantEmail = (await admin.firestore().collection(TENANT_COLLECTION).doc(userId).get()).data()?.email;
      if (type === 'bedspace-reservation' && room) {
        // update bedspace status to pending payment, occupied = status.
        const roomBeds = room.Bed;
        await admin.firestore().collection(ROOM_COLLECTION).doc(roomId).update({
          Bed: roomBeds.map((bed: any) => {
            const bedFromLineItems = lineItems.find((item: any) => item.uid === bed.uid);
            if (!bedFromLineItems) {
              return bed;
            } else {
              return {
                ...bed,
                occupied: {
                  status: 'pendingPayment',
                  checkoutUrl,
                  userId,
                  email: tenantEmail,
                  dateCreated: Date.now(),
                }
              };
            }
          }),
        });
      } else if (type === 'room-reservation' && room) {
        // update room status to pending payment
        await admin.firestore().collection(ROOM_COLLECTION).doc(roomId).update({
          occupied: {
            status: 'pendingPayment',
            checkoutUrl,
            userId,
            email: tenantEmail,
            dateCreated: Date.now(),
          }
        });
      }
      // TODO handle other payment types
      // TODO add section on users data to indicate that they have a pending payment

      response.send({
        paymentIntentId,
        checkoutUrl,
        userId, // TODO remove,
        roomId,
      });
    } catch (e) {
      functions.logger.log('error:', e);
      response.sendStatus(500);
    }
  }
);

// CLOUD FUNCTIONS

/**
 * Create paymongo payment session
 * Url: https://us-central1-cpstn-acb50.cloudfunctions.net/createPaymentSession
 */
export const createPaymentSession = functions.https.onRequest(app);

/**
 * paymongo webhook for successful and failed payments
 * Url: https://us-central1-cpstn-acb50.cloudfunctions.net/verifyPayment
*/
export const verifyPayment = functions.https.onRequest(async (request, response) => {
  functions.logger.log('verifyPayment request', request.body);
  functions.logger.log('body', request.body);
  const { attributes } = request.body.data;
  const eventType = attributes?.type;
  const paymentIntentId = attributes.data.attributes.payment_intent_id;

  functions.logger.log('event type and payment intent id: ', eventType, paymentIntentId);

  if (eventType === 'payment.paid') {
    const paymentSession = (await admin.firestore().collection(ACTIVE_PAYMENT_COLLECTION).doc(paymentIntentId).get()).data();
    functions.logger.log('paymentSession', paymentSession);

    const room = (await admin.firestore().collection(ROOM_COLLECTION).doc(paymentSession!.roomId).get()).data();
    if (paymentSession?.type === 'bedspace-reservation' && room) {
      // update room bed status to paid
      // const roomBeds = (await admin.firestore().collection(ROOM_COLLECTION).doc(paymentSession!.roomId).get()).data()?.Bed;
      const roomBeds = room.Bed;
      await admin.firestore().collection(ROOM_COLLECTION).doc(paymentSession!.roomId).update({
        Bed: roomBeds.map((bed: any) => {
          const bedFromLineItems = paymentSession!.lineItems.find((item: any) => item.uid === bed.uid);
          if (!bedFromLineItems) {
            return bed;
          } else {
            return {
              ...bed,
              occupied: {
                ...bed.occupied,
                status: 'paidPayment',
                datePaid: Date.now(),
              }
            };
          }
        }),
      });
    } else if(paymentSession?.type === 'room-reservation' && room) {
      // update room status to paid
      await admin.firestore().collection(ROOM_COLLECTION).doc(paymentSession!.roomId).update({
        occupied: {
          ...room.occupied,
          status: 'paidPayment',
          datePaid: Date.now(),
        }
      });
    }

    // update payment session status to paid
    await admin.firestore().collection(ACTIVE_PAYMENT_COLLECTION).doc(paymentIntentId).update({
      status: 'paid',
      paymentDetails: attributes.data.attributes,
    });

  }
  response.sendStatus(200);
});

/**
 * CronJob to delete expired payment sessions
 */
export const deleteExpiredPaymentSessions = functions.pubsub.schedule('0 * * * *').onRun(async (context) => {
  functions.logger.log('start deleteExpiredPaymentSessions');
  // get active payment sessions
  const activePaymentSessions = (
    await admin.firestore().collection(ACTIVE_PAYMENT_COLLECTION).get()).docs.map((doc) => Object.assign({paymentIntentId: doc.id}, doc.data())
  );
  // filter pending payments that are more that 24 hours old
  const expiredPaymentSessions = activePaymentSessions.filter((session) => session.status === 'pending' && Date.now() - session.dateCreated > 24 * 60 * 60 * 1000);
  // set the status of the expired payment sessions to expired
  await Promise.all(
    expiredPaymentSessions.map(
      async (session) => {
        await admin.firestore().collection(ACTIVE_PAYMENT_COLLECTION).doc(session.paymentIntentId).update({
          status: 'expired',
        });
        // delete occupied status of the bed
        if (session.type === 'bedspace-reservation') {
          const roomBeds = (await admin.firestore().collection(ROOM_COLLECTION).doc(session.roomId).get()).data()?.Bed;
          await admin.firestore().collection(ROOM_COLLECTION).doc(session.roomId).update({
            Bed: roomBeds.map((bed: any) => {
              const bedFromLineItems = session.lineItems.find((item: any) => item.uid === bed.uid);
              if (!bedFromLineItems) {
                return bed;
              } else {
                delete bed.occupied;
                return bed;
              }
            }),
          });
        } else if(session.type === 'room-reservation') {
          await admin.firestore().collection(ROOM_COLLECTION).doc(session.roomId).update({
            occupied: admin.firestore.FieldValue.delete(),
          });
        }
        // TODO handle other payment types

        // expire paymongo checkout session
        try {
          await fetch(`https://api.paymongo.com/v1/checkout_sessions/${session.checkoutSessionId}/expire`,{
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'authorization': `Basic ${Buffer.from(`${PAYMONGO_SECRET}:`).toString('base64')}`
            },
          });
        } catch(e) {
          functions.logger.log('error expiring paymongo checkout session', e);
        }
      }
    )
  );
  functions.logger.log('end deleteExpiredPaymentSessions');
});

// TODO function db hook to create and delete paymongo webhook, upon updating SDK secret key
// TODO function cron job to create monthly payment?