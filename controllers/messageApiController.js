const Message = require('../models/messageModel');
const catchAsync = require('../middlewares/catchAsync');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { from, subject, text } = req.body;

  const mailOptions = {
    from,
    to: process.env.EMAIL_FROM,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sended:', info.response);
      res.status(200).send('Email sended');
    }
  });

  try {
    const newMessage = await Message.create(req.body);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      requestedAt: req.requestTime,
    });
  }
});
