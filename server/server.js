import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import nodemailer from 'nodemailer'

const app = express()
const port = process.env.PORT || 3001
const upload = multer()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create the SMTP connection only when the first message is sent.
// This lets the frontend run locally even before email credentials are added.
const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const hasMailConfiguration = () => Boolean(
  process.env.SMTP_HOST
  && process.env.SMTP_USER
  && process.env.SMTP_PASS
  && process.env.CONTACT_EMAIL,
)

app.post('/api/contact', upload.none(), async (request, response) => {
  const { name, email, phone = '', message } = request.body

  // Validate required fields before contacting the mail provider.
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return response.status(400).json({ error: 'Name, email, and message are required.' })
  }

  if (!hasMailConfiguration()) {
    return response.status(503).json({ error: 'Email service is not configured yet.' })
  }

  try {
    await createTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      replyTo: email.trim(),
      subject: `Portfolio enquiry from ${name.trim()}`,
      text: [
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Phone: ${phone.trim() || 'Not provided'}`,
        '',
        message.trim(),
      ].join('\n'),
    })

    return response.status(200).json({ message: 'Your enquiry has been sent.' })
  } catch (error) {
    console.error('Unable to send contact email:', error.code || 'UNKNOWN', error.responseCode || '', error.message)
    return response.status(500).json({ error: 'Unable to send your enquiry right now.' })
  }
})

app.listen(port, () => {
  console.log(`Contact API listening on http://localhost:${port}`)
  if (hasMailConfiguration()) {
    createTransporter().verify()
      .then(() => console.log('SMTP connection verified.'))
      .catch((error) => console.error('SMTP connection failed:', error.code || 'UNKNOWN', error.responseCode || '', error.message))
  } else {
    console.warn('SMTP is not configured. Add the required values to .env before submitting the form.')
  }
})
