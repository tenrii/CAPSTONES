import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: 'spotahome.reservation@gmail.com', pass: process.env.MAIL_PASS }
});

export const sendMail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: 'spotahome.reservation@gmail.com',
    to,
    subject,
    html
  };

  return await transporter.sendMail(mailOptions);
}

// OWNER EMAILS

const ownerFooter = `
  <p>We value your trust in us and we assure you that we will take good care of your property. Should you have any concerns or inquiries, please do not hesitate to contact us.</p>
  <p>Thank you for your attention to this matter.</p>
  <p>Best regards,<br>
  Spot-a-Home Team</p>
`;

export const pendingBedspaceMailTemplate = (
  propertyName: string,
  roomName: string,
  bed: string, // bed number and placement
  owner: string,
  tenant: string,
  timestamp: string,
  amount: string,
) => {
  const subject = `Pending Payment - Bedspace Reservation in ${propertyName}`;
  const html = `
    <p>Dear ${owner},</p>
    <p>We hope this email finds you well. We are writing to inform you that ${tenant} has reserved a bed space in your ${roomName} ${bed} in ${propertyName} on ${timestamp}, but his/her payment of ${amount} is still pending.</p>
    <p>As per our policy, we require full payment to confirm any reservation. We'll kindly remind ${tenant} to settle the payment within 24 hours to avoid cancellation of the reservation.</p>
    ${ownerFooter}
  `;
  return {subject, html};
};

export const paidBedspaceMailTemplate = (
  propertyName: string,
  roomName: string,
  bed: string, // bed number and placement
  owner: string,
  tenant: string,
  timestamp: string,
  amount: string,
) => {
  const subject = `Bedspace Reservation Notification - ${roomName}`;
  const html = `
    <p>Dear ${owner},</p>
    <p>We hope this email finds you well. We're delighted to inform you that a bed space in your ${roomName} ${bed} in ${propertyName} has been reserved by ${tenant}. The reservation was made on ${timestamp}, and the transaction has been paid in full in the amount of ${amount}. ${tenant} is now confirmed as a tenant of your property.</p>
    ${ownerFooter}
  `;
  return {subject, html};
};

export const pendingRoomMailTemplate = (propertyName: string, roomName: string, owner: string, tenant: string, timestamp: string, amount: string) => {
  const subject = `Pending Payment - Room Reservation in ${propertyName}`;
  const html = `
    <p>Dear ${owner},</p>
    <p>We hope this email finds you well. We're writing to inform you that ${tenant} has reserved  ${roomName}  in your property ${propertyName} on ${timestamp}, but his/her payment of ${amount} is still pending.</p>
    <p>As per our policy, we require full payment to confirm any reservation. We'll kindly remind ${tenant} to settle the payment within 24 hours to avoid cancellation of the reservation.</p>
    ${ownerFooter}
  `;
  return {subject, html};
}

export const paidRoomMailTemplate = (propertyName: string, roomName: string, owner: string, tenant: string, timestamp: string, amount: string) => {
  const subject = `Room Reservation Notification - ${propertyName}`;
  const html = `
    <p>Dear ${owner},</p>
    <p>We hope this email finds you well. We are delighted to inform you that your ${roomName} in ${propertyName} has been reserved by ${tenant}. The reservation was made on ${timestamp}, and the transaction has been paid in full. ${tenant} is now confirmed as a tenant of your property.</p>
    ${ownerFooter}
  `;
  return {subject, html};
}

export const paidMonthlyEmailTemplate = (propertyName: string, roomName: string, owner: string, tenant: string, amount: string, month: string, bed?: string) => {
  const subject = `Monthly Billing Notification - ${propertyName}`;
  const html = `
    <p>Dear ${owner},</p>
    <p>We hope this message finds you well. We are writing to inform you that your tenant, ${tenant}, has settled their monthly bill for the month of ${month} for their  ${bed ? 'bed space' : 'room'} in ${roomName} ${bed ? bed : ''} in ${propertyName}. The amount paid was ${amount}.</p>
    <p>We understand that your trust in us to manage your property is of utmost importance and we assure you that we will continue to provide reliable and efficient service. If you have any concerns or inquiries, please do not hesitate to contact us.</p>
    <p>Thank you for your continued patronage.</p>
    <p>Best regards,<br>
    Spot-a-Home Team</p>
  `;
  return {subject, html};
}

export const overdueMonthlyEmailTemplate = (propertyName: string, roomName: string, owner: string, tenant: string, month: string) => {
  const subject = `Monthly Billing Past Due Notification - ${propertyName}`;
  const html = `
    <p>Dear ${owner},</p>
    <p>We hope this message finds you well. We are writing to inform you that your tenant, ${tenant}, is currently past due on their monthly rental payment for the month of ${month}.</p>
    <p>We have sent reminders to ${tenant} and we are actively working to resolve the situation. However, we wanted to keep you informed about the current status of their payment.</p>
    <p>As always, we are committed to ensuring the timely collection of rental payments and we will continue to follow up with your tenant until the matter is resolved.</p>
    <p>If you have any questions or concerns, please do not hesitate to contact us. We appreciate your trust in us and we thank you for your cooperation.</p>
    <p>Best regards,<br>
    Spot-a-Home Team</p>
  `;
  return {subject, html};
}

export const ownerAcceptedByAdmin = (owner: string) => {
  const subject = 'Account Activation and Listing Confirmation - Spot a Home Search and Reservation System';
  const html = `
    <p>Dear ${owner},</p>
    <p>We are pleased to inform you that your registration account as a boarding house owner on our Spot a Home Search and Reservation System with Cashless Payments in Science City of Munoz has been successfully accepted and activated!</p>
    <p>Congratulations! You can now proceed to log in to your account and start listing your available rooms for potential tenants to discover and book. We appreciate your patience throughout the registration process, and we are excited to have you as part of our platform.</p>
    <p>Thank you for choosing our Spot a Home Search and Reservation System. We appreciate your trust in our services and wish you great success in renting out your rooms to satisfied tenants.</p>
    <p>Yours truly,<br>
    Spot-a-Home Team</p>
  `;
  return {subject, html};
}

export const ownerRejectedByAdmin = (owner: string, reason: string) => {
  const subject = 'Rejection of Registration Account - Spot a Home Search and Reservation System';
  const html = `
    <p>Dear ${owner},</p>
    <p>We regret to inform you that your registration account as a boarding house owner on our Spot a Home Search and Reservation System with Cashless Payments in Science City of Munoz has been rejected.</p>
    <p>After a thorough review of your application, we have determined that you ${reason}. We understand your interest in joining our system, and we appreciate your efforts in completing the registration process.</p>
    <p>To proceed with your registration, we kindly request you to submit the following necessary documents.</p>
    <p>Thank you!</p>
    <p>Yours truly,<br>
    Spot-a-Home Team</p>
  `;
  return {subject, html};
}

export const roomAcceptedByAdmin = (owner: string, roomName: string) => {
  const subject = 'Room Listing Approval - Spot a Home Search and Reservation System';
  const html = `
    <p>Dear ${owner},</p>
    <p>Congratulations!<br>
    We are pleased to inform you that your room listing ${roomName} on our Spot a Home Search and Reservation System has been approved!</p>
    <p>Your room is now visible to potential tenants, and they can start booking it through our platform.</p>
    <p>Thank you for choosing our system to showcase your boarding house. We wish you great success in finding suitable tenants and generating positive experiences through our platform.</p>
    <p>Best regards,<br></p>
    Spot-a-Home Team</p>
  `;
  return {subject, html};
}

export const roomRejectedByAdmin = (owner: string, roomName: string, reason: string) => {
  const subject = 'Room Listing Rejection - Spot a Home Search and Reservation System';
  const html = `
    <p>Dear ${owner},</p>
    <p>Congratulations!<br>
    <p>We regret to inform you that your room listing ${roomName} on our Spot a Home Search and Reservation System has been rejected. We understand that this news may be disappointing, but we have carefully reviewed your submission and due to ${reason}.</p>
    <p>Thank you for your understanding. We appreciate your commitment to providing quality listings, and we look forward to the possibility of reviewing your revised submission in the future.</p>
    <p>Yours truly,<br></p>
    Spot-a-Home Team</p>
  `;
  return {subject, html};
}

// END OF OWNER EMAILS
// TENANT EMAILS

const tenantFooter = `
  <p>Should you have any concerns or inquiries, please do not hesitate to contact us. We appreciate your interest in our boarding house search and reservation system.</p>
  <p>Best regards,<br>
  Spot-a-Home Team</p>
`;

export const pendingBedspaceMailTemplateTenant = (
  propertyName: string,
  roomName: string,
  bed: string, // bed number and placement
  tenant: string,
  timestamp: string,
  amount: string,
) => {
  const subject = `Bedspace Reservation Pending - ${propertyName}`;
  const html = `
    <p>Dear ${tenant},</p>
    <p>We hope this message finds you well. We are writing to confirm your reservation of a bed space in ${roomName} ${bed} in ${propertyName}, which was made on ${timestamp}}.</p>
    <p>We would like to remind you that as per our policy, full payment of ${amount} is required to confirm your reservation. Unfortunately, we have not yet received your full payment for the reservation. Please settle the payment within 24 hours to avoid cancellation of your reservation.</p>
    <p>Once the payment has been received, we will send you a confirmation message.</p>
    ${tenantFooter}
  `;
  return {subject, html};
};

export const paidBedspaceMailTemplateTenant = (
  propertyName: string,
  roomName: string,
  bed: string, // bed number and placement
  tenant: string,
  timestamp: string,
  amount: string,
) => {
  const subject = `Bedspace Reservation Confirmation - ${propertyName}`;
  const html = `
    <p>Dear ${tenant},</p>
    <p>We hope this message finds you well. We are writing to confirm your reservation of a room in ${roomName} ${bed} in ${propertyName}, which was made on ${timestamp}</p>
    <p>We are happy to inform you that the owner of ${propertyName} has received your payment of ${amount} for the reservation and your tenancy is now confirmed.</p>
    ${tenantFooter}
  `;
  return {subject, html};
};

export const pendingRoomMailTemplateTenant = (propertyName: string, roomName: string, tenant: string, timestamp: string, amount: string) => {
  const subject = `Room Reservation Pending -  ${propertyName}`;
  const html = `
    <p>Dear ${tenant},</p>
    <p>We hope this message finds you well. We are writing to confirm your reservation of a room in ${roomName} in ${propertyName}, which was made on ${timestamp}.</p>
    <p>We would like to remind you that as per our policy, full payment of ${amount} is required to confirm your reservation. Unfortunately, we have not yet received your full payment for the reservation. Please settle the payment within 24 hours to avoid cancellation of your reservation.</p>
    <p>Once the payment has been received, we will send you a confirmation message.</p>
    ${ownerFooter}
  `;
  return {subject, html};
}

export const paidRoomMailTemplateTenant = (propertyName: string, roomName: string, tenant: string, timestamp: string, amount: string) => {
  const subject = `Room Reservation Confirmation - ${propertyName}`;
  const html = `
    <p>Dear ${tenant},</p>
    </p>We hope this message finds you well. We are writing to confirm your reservation of a room in ${roomName} in ${propertyName}, which was made on ${timestamp}</p>
    </p>We are happy to inform you that the owner of ${propertyName} has received your payment of ${amount} for the reservation and your tenancy is now confirmed.</p>
    ${ownerFooter}
  `;
  return {subject, html};
}

const monthlyFooterTenant = `
  <p>We appreciate your prompt attention to this matter and thank you for your cooperation. Should you have any concerns or inquiries, please do not hesitate to contact us.</p>
  <p>Best regards,<br>
  Spot-a-Home Team</p>
`;

export const monthlyBillingBedspaceTenant = (
  propertyName: string,
  roomName: string,
  bed: string, // bed number and placement
  tenant: string,
  // amount: string,
  month: string,
  link: string
) => {
  const subject = `Monthly Billing - ${propertyName}`;
  const html = `
    <p>Dear ${tenant},</p>
    <p>We hope this message finds you well. We would like to inform you that your monthly bill for the month of ${month} is now due for payment for your bed space in ${roomName} ${bed} in ${propertyName}.</p>
    <p>As a friendly reminder, please settle your monthly payment on or before the due date to avoid any late charges. You can easily make your payment by accessing your Spot-a-Home Reservation account through this link: <a href="${link}">${link}</a></p>
    <p>If you have already settled your payment, please disregard this message.</p>
    ${monthlyFooterTenant}
  `;
  return {subject, html};
};

export const monthlyBillingRoomTenant = (
  propertyName: string,
  roomName: string,
  tenant: string,
  // amount: string,
  month: string,
  link: string
) => {
  const subject = `Monthly Billing - ${propertyName}`;
  const html = `
    <p>Dear ${tenant},</p>
    <p>We hope this message finds you well. We would like to inform you that your monthly bill for the month of ${month} is now due for payment for your room ${roomName} in ${propertyName}.</p>
    <p>As a friendly reminder, please settle your monthly payment on or before the due date to avoid any late charges. You can easily make your payment by accessing your Spot-a-Home Reservation account through this link: <a href="${link}">${link}</a></p>
    <p>If you have already settled your payment, please disregard this message.</p>
    ${monthlyFooterTenant}
  `;
  return {subject, html};
};

const monthlyBillingPaidFooterTenant = `
  <p>Thank you for settling your payment promptly. Your payment has been successfully processed, and your account is now up to date. We appreciate your timely response.</p>
  <p>If you have any further questions or concerns regarding your payment or any other matter, please feel free to reach out to us. We are here to assist you.</p>
  <p>Once again, thank you for your cooperation. We value you as a tenant and look forward to continuing to provide you with excellent service.</p>
  <p>Best regards,<br>
  Spot-a-Home Team</p>
`;

export const monthlyBillingPaidBedspaceTenant = (
  propertyName: string,
  roomName: string,
  bed: string, // bed number and placement
  tenant: string,
  amount: string,
  month: string,
) => {
  const subject = `Monthly Billing - ${propertyName}`;
  const html = `
    <p>Dear ${tenant},</p>
    <p>We hope this email finds you well. We would like to inform you that we have received your payment for the monthly bill of ${amount} for the month of ${month} for your bed space in ${roomName} ${bed} in ${propertyName}.</p>
    ${monthlyBillingPaidFooterTenant}
  `;
  return {subject, html};
};

export const monthlyBillingPaidRoomTenant = (
  propertyName: string,
  roomName: string,
  tenant: string,
  amount: string,
  month: string,
) => {
  const subject = `Monthly Billing - ${propertyName}`;
  const html = `
    <p>Dear ${tenant},</p>
    <p>We hope this email finds you well. We would like to inform you that we have received your payment for the monthly bill of ${amount} for the month of ${month} for your room in ${roomName} in ${propertyName}.</p>
    ${monthlyBillingPaidFooterTenant}
  `;
  return {subject, html};
};

export const monthlyBillingOverdueTenant = (
  propertyName: string,
  roomName: string,
  bed: string, // bed number and placement
  tenant: string,
  // amount: string,
  month: string,
  link: string
) => {
  const subject = `Monthly Billing Past Due - ${propertyName}`;
  const html = `
    <p>Dear ${tenant},</p>
    We hope this message finds you well. This is to inform you that your monthly bill for the month of ${month} for your ${bed.length ? 'bed space' : 'room'} in ${roomName} ${bed.length ? bed : ''} in ${propertyName} is now past due.
    As per ${propertyName} rental policy, late charges will be applied for payments made after the due date. We kindly remind you to settle your payment as soon as possible to avoid additional charges.
    Please settle your payment by accessing your account on Spot-a-Home Reservation here's the link <a href="${link}">${link}</a>. If you have already settled your payment, please disregard this message.
    ${monthlyFooterTenant}
  `;
  return {subject, html};
};

// END OF TENANT EMAILS

