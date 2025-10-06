const { Resend } = require("resend");
const resend = new Resend(`${process.env.RESEND_API_URL}`);

resend.emails.send({
  from: "onboarding@resend.dev",
  to: "ademuyiwahassan68@gmail.com",
  subject: "Hello World",
  html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
});

const sendWelcomeEmail = (email, name) => {
  resend.emails.send({
    from: "Hassan <onboarding@resend.dev>",
    to: email,
    subject: "Welcome to Our Service",
    html: `<p>Hi ${name},</p><p>Welcome to our service! We're glad to have you on board.</p>`,
  });
};
(req, res) => {
  const { email, name } = req.body;
  sendWelcomeEmail(email, name);
  res.status(200).send("Welcome email sent");
};

const sendLoginAlert = (email, name) => {
  resend.emails.send({
    from: "Hassan <onboarding@resend.dev>",
    to: email,
    subject: "New Login Alert",
    html: `<p>Hi ${name},</p><p>We noticed a new login to your account. If this was you, you can safely ignore this email. If not, please secure your account.</p>`,
  });
};

const sendLogoutAlert = (email, name) => {
  resend.emails.send({
    from: "Hassan <onboarding@resend.dev>",
    to: email,
    subject: "Logout Alert",
    html: `<p>Hi ${name},</p><p>You have been logged out of your account. If this was you, you can safely ignore this email. If not, please secure your account.</p>`,
  });
};

const sendDelectionAlert = (email, name) => {
  resend.emails.send({
    from: "Hassan <onboarding@resend.dev>",
    to: email,
    subject: "Account Deletion",
    html: `<p>Hi ${name},</p><p>Your account has been successfully deleted. We're sorry to see you go!</p>`,
  });
};

const sendTaskCreationEmail = (email, task, name) => {
  resend.emails.send({
    from: "Hassan <onboarding@resend.dev>",
    to: email,
    subject: "Task Created",
    html: `<p>Hi ${name},</p><p>Your task "${task}" has been created successfully.</p>`,
  });
};

const sendTaskDeletionEmail = (email, task, name) => {
  resend.emails.send({
    from: "Hassan <onboarding@resend.dev>",
    to: email,
    subject: "Task Deleted",
    html: `<p>Hi ${name},</p><p>Your task "${task}" has been deleted successfully.</p>`,
  });
};

const sendTaskUpdateEmail = (email, task, name) => {
  resend.emails.send({
    from: "Hassan <onboarding@resend.dev>",
    to: email,
    subject: "Task Updated",
    html: `<p>Hi ${name},</p><p>Your task "${task}" has been updated successfully.</p>`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendLoginAlert,
  sendLogoutAlert,
  sendDelectionAlert,
  sendTaskCreationEmail,
  sendTaskDeletionEmail,
  sendTaskUpdateEmail,
};
