'use server'

import { google } from 'googleapis'
import webpush from 'web-push'

function getSheetsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '')
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeToNewsletter(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name  = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  try {
    const sheets = getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_NEWSLETTER_FILE_ID!
    const tab = 'Blad1' // Change this to your actual sheet/tab name

    // 1. Fetch all existing data (headers + rows)
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: tab,
    })

    const rows: string[][] = (existing.data.values as string[][] | null) ?? []

    // 2. If sheet is empty, write header row + first data row together
    if (rows.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${tab}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            ['Date', 'Email Address', 'Name'],
            [new Date().toISOString(), email, name],
          ],
        },
      })
      return { success: true }
    }

    // 3. Read headers and locate each column by name
    const headers = rows[0].map((h) => String(h).trim().toLowerCase())
    const emailColIdx = headers.findIndex((h) => /e.?mail/i.test(h))
    const nameColIdx  = headers.findIndex((h) => /^name$/i.test(h))
    const tsColIdx    = headers.findIndex((h) => /timestamp|date|time/i.test(h))

    // 4. Duplicate email check
    if (emailColIdx >= 0) {
      const isDuplicate = rows.slice(1).some(
        (row) => String(row[emailColIdx] ?? '').trim().toLowerCase() === email
      )
      if (isDuplicate) {
        return { success: false, error: 'This email is already subscribed.' }
      }
    }

    // 5. Build row: start with nulls (no value) for every column,
    //    then fill only the recognized positions — never insert empty strings
    const newRow: (string | null)[] = new Array(headers.length).fill(null)

    if (tsColIdx >= 0)    newRow[tsColIdx]    = new Date().toISOString()
    if (nameColIdx >= 0)  newRow[nameColIdx]  = name
    if (emailColIdx >= 0) newRow[emailColIdx] = email

    // If no header matched at all, fall back to simple positional append
    const anyMatched = tsColIdx >= 0 || nameColIdx >= 0 || emailColIdx >= 0
    const rowToInsert = anyMatched
      ? newRow.map((v) => v ?? '')   // replace remaining nulls with '' only now
      : [new Date().toISOString(), name, email]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowToInsert] },
    })

    return { success: true }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return { success: false, error: 'Failed to save subscription. Please try again.' }
  }
}



let subscription: webpush.PushSubscription | null = null

export async function subscribeUser(sub: webpush.PushSubscription) {
  subscription = sub
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('No subscription available')
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}
