import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import { getUserSubscription } from "../services/subscription.service.js";
import dayjs from "dayjs";
import { sendMessage } from './lib/telegram.js';

const frequencies = {
  'daily' : 1, 
  'weekly' : 7, 
  'monthly' : 30, 
  'yearly' : 365,
}
const REMINDERS = [7, 1];

export const sendReminders = serve(async (context) => {
  const { messageObj, subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription) return;

  const renewaldate = dayjs(subscription.renewaldate);

  if (renewaldate.isBefore(dayjs())) {
    // Update renewaldate
    const newRenewalDate = renewaldate.add(frequencies[subscription.frequency], 'day');
    subscription.updateOne({ renewaldate: newRenewalDate });

    // Trigger new workflow? Is that right?
  }

  for (const daysBefore of REMINDERS) {
    
    const reminderDate = renewaldate.subtract(daysBefore, 'day');

    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
    }

    await triggerReminder(context, messageObj, `Reminder ${daysBefore} days before`);
  }


});

const sleepUntilReminder = async(context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, messageObj, label) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`);
    await sendMessage(messageObj , `Your subscription is ${label}`);
  });
}

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run('get subscription', async () => {
    return await getUserSubscription(subscriptionId);
  })
}