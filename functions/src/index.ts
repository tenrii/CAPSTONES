import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import fetch from 'node-fetch';
import {
  monthlyBillingBedspaceTenant,
  monthlyBillingOverdueTenant,
  monthlyBillingPaidBedspaceTenant,
  monthlyBillingPaidRoomTenant,
  monthlyBillingRoomTenant,
  paidBedspaceMailTemplate,
  paidBedspaceMailTemplateTenant,
  paidMonthlyEmailTemplate,
  paidRoomMailTemplate,
  paidRoomMailTemplateTenant,
  pendingBedspaceMailTemplate,
  pendingBedspaceMailTemplateTenant,
  pendingRoomMailTemplate,
  pendingRoomMailTemplateTenant,
  sendMail,
} from './libs/mailer';
import * as moment from 'moment-timezone';

const app = express();
admin.initializeApp();

const timezone = 'Asia/Manila';
const dateTimeFormat = 'MMMM DD, YYYY hh:mm A';

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
const OWNER_COLLECTION = 'Owner';
const TENANT_RESERVATION_COLLECTION = 'Reservations';
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

      // type: bedspace-reservation, room-reservation, monthly-bill
      const { roomId, type } = request.body;
      let lineItems = request.body.lineItems;
      const url = 'https://api.paymongo.com/v1/checkout_sessions';
      const room = (await admin.firestore().collection(ROOM_COLLECTION).doc(roomId).get()).data();
      const userId = (request as any).user.uid;
      let lastPaymentMonth: any = null;
      let roomReservation: any = null;

      // make sure room or bed is not occupied
      if (type === 'bedspace-reservation' && room) {
          room.Bed.forEach((bed: any) => {
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
      } else if (type === 'monthly-bill' && room) {
        roomReservation = (await admin.firestore()
          .collection(TENANT_COLLECTION)
          .doc(userId)
          .collection(TENANT_RESERVATION_COLLECTION)
          .doc(roomId)
          .get()).data();

        if (!roomReservation) {
          functions.logger.log('no room reservation found');
          return;
        }

        lastPaymentMonth = roomReservation?.payments?.length > 0 ? roomReservation?.payments.sort((a: any, b: any) => b.monthDate - a.monthDate).pop().monthDate : roomReservation?.dateCreated;

        lineItems = roomReservation.lineItems.map((item: any) => ({
          ...item,
          name: lastPaymentMonth ? `${item.name} (${moment(lastPaymentMonth).tz(timezone).add(1, 'month').format('MMMM')})` : item.name,
        }));

        // if payment attempt already exists return that instead
        if (roomReservation.pending?.length) {
          for (const pending of roomReservation.pending) {
            if (pending.monthDate === moment(lastPaymentMonth).add(1, 'month').toDate().getTime()) {
              response.send({
                paymentIntentId: pending.paymentSessionID,
                checkoutUrl: pending.checkoutUrl,
                userId,
                roomId,
              });
              functions.logger.log('Reused old payment session');
              return;
            }
          }
        }
      }

      // return to room page
      functions.logger.log('request headers', request.headers);
      const roomUrl = type === 'monthly-bill' ? `${request.headers.origin}/tenant-panel` : `${request.headers.origin}/room/${roomId}`;
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

      const tenantData = (await admin.firestore().collection(TENANT_COLLECTION).doc(userId).get()).data()
      const tenantEmail = tenantData?.email || tenantData?.Email || '';
      const owner: any = (await admin.firestore().collection(OWNER_COLLECTION).doc(room!.ownerId).get()).data();
      const ownerEmail = owner?.email || owner?.Email || '';
      const timestamp = moment().tz(timezone).format(dateTimeFormat);
      const amount = `P${lineItems.reduce((acc: any, item: any) => {
          return acc + parseFloat(item.amount);
        }, 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

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

        // send email notifications
        const beds = lineItems.map((item: any) => item.name).join(', ');

        const { subject: subjectOwner, html: htmlOwner } = pendingBedspaceMailTemplate(
          room.Title,
          room.RoomName || 'Room',
          beds,
          `${owner.FName} ${owner.LName}`,
          `${tenantData?.FName} ${tenantData?.LName}`,
          timestamp,
          amount,
        );

        const { subject: subjectTenant, html: htmlTenant } = pendingBedspaceMailTemplateTenant(
          room.Title,
          room.RoomName || 'Room',
          beds,
          `${tenantData?.FName} ${tenantData?.LName}`,
          timestamp,
          amount,
        );

        await Promise.all([
          sendMail(ownerEmail, subjectOwner, htmlOwner),
          sendMail(tenantEmail, subjectTenant, htmlTenant),
        ]);

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

        const { subject: subjectOwner, html: htmlOwner } = pendingRoomMailTemplate(
          room.Title,
          room.RoomName || 'Room',
          `${owner.FName} ${owner.LName}`,
          `${tenantData?.FName} ${tenantData?.LName}`,
          timestamp,
          amount
        );

        const { subject: subjectTenant, html: htmlTenant } = pendingRoomMailTemplateTenant(
          room.Title,
          room.RoomName || 'Room',
          `${tenantData?.FName} ${tenantData?.LName}`,
          timestamp,
          amount
        );

        await Promise.all([
          sendMail(ownerEmail, subjectOwner, htmlOwner),
          sendMail(tenantEmail, subjectTenant, htmlTenant),
        ]);
      } else if (type === 'monthly-bill' && room) {
        await admin.firestore()
          .collection(TENANT_COLLECTION)
          .doc(userId)
          .collection(TENANT_RESERVATION_COLLECTION)
          .doc(roomId)
          .update({
            dateUpdated: Date.now(),
            pending: admin.firestore.FieldValue.arrayUnion({
              dateCreated: Date.now(),
              checkoutUrl,
              month: moment(lastPaymentMonth).tz(timezone).add(1, 'month').format('MMMM'),
              monthDate: moment(lastPaymentMonth).tz(timezone).add(1, 'month').toDate().getTime(),
              paymentSessionID: paymentIntentId,
            }),
          });
        }

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
export const createPaymentSession = functions.runWith({secrets: ['MAIL_PASS']}).https.onRequest(app);

/**
 * paymongo webhook for successful and failed payments
 * Url: https://us-central1-cpstn-acb50.cloudfunctions.net/verifyPayment
*/
export const verifyPayment = functions.runWith({secrets: ['MAIL_PASS']}).https.onRequest(async (request, response) => {
  functions.logger.log('verifyPayment request', request.body);
  functions.logger.log('body', request.body);
  const { attributes } = request.body.data;
  const eventType = attributes?.type;
  const paymentIntentId = attributes.data.attributes.payment_intent_id;
  const promises = [];

  functions.logger.log('event type and payment intent id: ', eventType, paymentIntentId);

  if (eventType === 'payment.paid') {
    const paymentSession = (await admin.firestore().collection(ACTIVE_PAYMENT_COLLECTION).doc(paymentIntentId).get()).data();
    functions.logger.log('paymentSession', paymentSession);

    const room = (await admin.firestore().collection(ROOM_COLLECTION).doc(paymentSession!.roomId).get()).data();
    const owner: any = (await admin.firestore().collection(OWNER_COLLECTION).doc(room!.ownerId).get()).data();
    const tenant: any = (await admin.firestore().collection(TENANT_COLLECTION).doc(paymentSession!.userId).get()).data();
    const ownerEmail = owner?.email || owner?.Email || '';
    const tenantEmail = tenant?.email || tenant?.Email || '';
    const timestamp = moment().tz(timezone).format(dateTimeFormat);
    const amountNumber = paymentSession!.lineItems.reduce((acc: any, item: any) => {
      return acc + parseFloat(item.amount);
    }, 0);
    const amount = `P${amountNumber.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

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
    } else if (paymentSession?.type === 'monthly-bill' && room) {
      const dateNow = Date.now();
      const roomReservation = (await admin.firestore()
        .collection(TENANT_COLLECTION)
        .doc(paymentSession?.userId)
        .collection(TENANT_RESERVATION_COLLECTION)
        .doc(paymentSession?.roomId)
        .get()).data();

      if (!roomReservation) {
        functions.logger.log('no room reservation found');
        return;
      }
      const lastPaymentMonth = roomReservation?.payments?.length > 0 ? roomReservation?.payments.sort((a: any, b: any) => b.monthDate - a.monthDate).pop().monthDate : roomReservation?.dateCreated;
      const monthToBePaid = moment(lastPaymentMonth).tz(timezone).add(1, 'month');
      await admin.firestore()
        .collection(TENANT_COLLECTION)
        .doc(paymentSession?.userId)
        .collection(TENANT_RESERVATION_COLLECTION)
        .doc(paymentSession?.roomId)
        .update({
          dateUpdated: dateNow,
          pending: roomReservation?.pending?.filter((item: any) => item.paymentSessionID !== paymentIntentId),
          payments: admin.firestore.FieldValue.arrayUnion({
            dateCreated: dateNow,
            month: monthToBePaid.format('MMMM'),
            monthDate: monthToBePaid.toDate().getTime(),
            amount: amountNumber,
            paymentSessionID: paymentIntentId,
          }),
        });

      if (roomReservation?.type === 'bedspace-reservation') {
        const beds = roomReservation.lineItems.map((item: any) => item.name).join(', ');
        const { subject: subject, html: html } = monthlyBillingPaidBedspaceTenant(
          room.Title,
          room.RoomName || 'Room',
          beds,
          `${tenant.FName} ${tenant.LName}`,
          amount,
          monthToBePaid.format('MMMM'),
        );
        promises.push(sendMail(tenantEmail, subject, html));

        const {subject: ownerEmailSubject, html: ownerEmailHtml} = paidMonthlyEmailTemplate(
          room.Title,
          room.RoomName || 'Room',
          `${owner.FName} ${owner.LName}`,
          `${tenant.FName} ${tenant.LName}`,
          amount,
          monthToBePaid.format('MMMM'),
          beds,
        );
        promises.push(sendMail(ownerEmail, ownerEmailSubject, ownerEmailHtml));
      } else if (roomReservation?.type === 'room-reservation') {
        const { subject: subject, html: html } = monthlyBillingPaidRoomTenant(
          room.Title,
          room.RoomName || 'Room',
          `${tenant.FName} ${tenant.LName}`,
          amount,
          monthToBePaid.format('MMMM'),
        );
        promises.push(sendMail(tenantEmail, subject, html));

        const {subject: ownerEmailSubject, html: ownerEmailHtml} = paidMonthlyEmailTemplate(
          room.Title,
          room.RoomName || 'Room',
          `${owner.FName} ${owner.LName}`,
          `${tenant.FName} ${tenant.LName}`,
          amount,
          monthToBePaid.format('MMMM'),
        );
        promises.push(sendMail(ownerEmail, ownerEmailSubject, ownerEmailHtml));
      }
    }

    // if bedspace or room type save to tenant
    if (paymentSession?.type === 'bedspace-reservation' || paymentSession?.type === 'room-reservation') {
      const dateNow = Date.now();
      const hasExistingReservation = (await admin.firestore()
        .collection(TENANT_COLLECTION)
        .doc(paymentSession?.userId)
        .collection(TENANT_RESERVATION_COLLECTION)
        .doc(paymentSession?.roomId)
        .get()).data();

      if (hasExistingReservation) {
        await admin.firestore()
          .collection(TENANT_COLLECTION)
          .doc(paymentSession?.userId)
          .collection(TENANT_RESERVATION_COLLECTION)
          .doc(paymentSession?.roomId)
          .update({
            paymentSessionIDs: admin.firestore.FieldValue.arrayUnion(paymentIntentId),
            lineItems: admin.firestore.FieldValue.arrayUnion(...paymentSession?.lineItems),
            amount: hasExistingReservation.amountNumber + amountNumber,
            dateUpdated: dateNow,
            month: moment().tz(timezone).format('MMMM'),
          });
      } else {
        await admin.firestore()
          .collection(TENANT_COLLECTION)
          .doc(paymentSession?.userId)
          .collection(TENANT_RESERVATION_COLLECTION)
          .doc(paymentSession.roomId)
          .set({
            paymentSessionIDs: [paymentIntentId],
            roomId: paymentSession?.roomId,
            type: paymentSession?.type,
            lineItems: paymentSession?.lineItems,
            amount: amountNumber,
            dateCreated: dateNow,
            dateUpdated: dateNow,
            month: moment().tz(timezone).format('MMMM'),
            status: 'active',
            payments: []
          });
      }
    }

    // update payment session status to paid
    await admin.firestore().collection(ACTIVE_PAYMENT_COLLECTION).doc(paymentIntentId).update({
      status: 'paid',
      paymentDetails: attributes.data.attributes,
      datePaid: Date.now(),
    });

    // send notification email
    if (paymentSession?.type === 'room-reservation' && room) {
      const { subject: subjectOwner, html: htmlOwner} = paidRoomMailTemplate(
        room.Title,
        room.RoomName || 'Room',
        `${owner.FName} ${owner.LName}`,
        `${tenant.FName} ${tenant.LName}`,
        timestamp,
        amount
      );
      const { subject: subjectTenant, html: htmlTenant} = paidRoomMailTemplateTenant(
        room.Title,
        room.RoomName || 'Room',
        `${tenant.FName} ${tenant.LName}`,
        timestamp,
        amount
      );
      promises.push(
        sendMail(ownerEmail, subjectOwner, htmlOwner),
        sendMail(tenantEmail, subjectTenant, htmlTenant),
      );
    } else if (paymentSession?.type === 'bedspace-reservation' && room) {
      const beds = paymentSession.lineItems.map((item: any) => item.name).join(', ');
      const { subject: subjectOwner, html: htmlOwner} = paidBedspaceMailTemplate(
        room.Title,
        room.RoomName || 'Room',
        beds,
        `${owner.FName} ${owner.LName}`,
        `${tenant.FName} ${tenant.LName}`,
        timestamp,
        amount
      );
      const { subject: subjectTenant, html: htmlTenant} = paidBedspaceMailTemplateTenant(
        room.Title,
        room.RoomName || 'Room',
        beds,
        `${tenant.FName} ${tenant.LName}`,
        timestamp,
        amount
      );
      promises.push(
        sendMail(ownerEmail, subjectOwner, htmlOwner),
        sendMail(tenantEmail, subjectTenant, htmlTenant),
      );
    }

    await Promise.all(promises);
  }
  functions.logger.log('verifyPayment end');
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
  const expiredPaymentSessions = activePaymentSessions
    .filter((session) =>
      session.status === 'pending' &&
      session.type !== 'monthly-bill' &&
      Date.now() - session.dateCreated > 24 * 60 * 60 * 1000
    );
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

/**
 * Cronjob to send billing reminders
 */
export const sendBillingReminders = functions
  .runWith({secrets: ['MAIL_PASS']})
  .pubsub
  .schedule('0 8 * * *')
  .timeZone(timezone)
  .onRun(async (context) => {
    functions.logger.log('start sendBillingReminders');
    const appHost = 'https://cpstn-acb50.web.app'; // APP HOST
    const activeReservations = (await admin.firestore().collectionGroup(TENANT_RESERVATION_COLLECTION).where('status', '==', 'active').get());
    functions.logger.log('activeReservations', activeReservations.docs.length);

    await Promise.all(activeReservations.docs.map(async (reservation) => {
      const reservationData = reservation.data();
      const tenant = await admin.firestore().collection(TENANT_COLLECTION).doc(reservation!.ref!.parent!.parent!.id).get();
      const tenantData = tenant.data();
      const room = await admin.firestore().collection(ROOM_COLLECTION).doc(reservationData.roomId).get();
      const roomData = room.data();
      const beds = reservationData.lineItems?.map((item: any) => item.name).join(', ');
      // const owner = await admin.firestore().collection(OWNER_COLLECTION).doc(roomData!.ownerId).get();
      // const ownerData = owner.data();
      const tenantEmail = tenantData?.Email;
      if (!roomData || !tenantData) {
        functions.logger.log('no room or tenant data');
        return;
      }
      const lastPaidMonth = moment(reservationData?.payments?.length > 0 ? reservationData?.payments.sort((a: any, b: any) => b.monthDate - a.monthDate).pop().monthDate : reservationData?.dateCreated).tz(timezone);
      const dateNow =  moment().tz(timezone);
      const nextBillingDate = lastPaidMonth.add(1, 'month');
      if (dateNow.isBefore(nextBillingDate.subtract(2, 'day'), 'day')) {
        functions.logger.log('before billing day');
        return;
      } else if (
        dateNow.isSameOrBefore(nextBillingDate, 'day') &&
        dateNow.isSameOrAfter(nextBillingDate.subtract(2, 'day'), 'day')
      ) {
        if (reservationData.type === 'room-reservation') {
          const { subject: subjectTenant, html: htmlTenant } = monthlyBillingRoomTenant(
            roomData!.Title,
            roomData!.RoomName || 'Room',
            `${tenantData?.FName} ${tenantData?.LName}`,
            nextBillingDate.format('MMMM'),
            `${appHost}/tenant-panel`
          );
          await sendMail(tenantEmail, subjectTenant, htmlTenant);
        } else if (reservationData.type === 'bedspace-reservation') {
          const { subject: subjectTenant, html: htmlTenant } = monthlyBillingBedspaceTenant(
            roomData!.Title,
            roomData!.RoomName || 'Room',
            beds || '',
            `${tenantData?.FName} ${tenantData?.LName}`,
            nextBillingDate.format('MMMM'),
            `${appHost}/tenant-panel`
          );
          await sendMail(tenantEmail, subjectTenant, htmlTenant);
        }
      } else {
        const { subject: subjectTenant, html: htmlTenant } = monthlyBillingOverdueTenant(
          roomData!.Title,
          roomData!.RoomName || 'Room',
          (reservationData.type === 'room-reservation' ? '' : beds) || '',
          `${tenantData?.FName} ${tenantData?.LName}`,
          nextBillingDate.format('MMMM'),
          `${appHost}/tenant-panel`
        );
        await sendMail(tenantEmail, subjectTenant, htmlTenant);
      }
    }));
    functions.logger.log('end sendBillingReminders');
});


// TODO function db hook to create and delete paymongo webhook, upon updating SDK secret key
