import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import { getUserSubscription } from "../services/subscription.service.js";
import dayjs from "dayjs";
import { sendMessage } from './lib/telegram.js';
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from '../config/env.js';
import Subscription from '../models/subscription.model.js';
import User from '../models/user.model.js';

const frequencies = {
  'daily': 1,
  'weekly': 7,
  'monthly': 30,
  'yearly': 365,
}

const REMINDERS = [7, 1];

export const checkSubscriptionRenewalDate = serve(async (context) => {

  console.log("Verifying Subscriptions Renewal Date...");

  const subscriptions = await fetchAllSubscriptions(context);

  for (const subscription of subscriptions) {

    // Get the renewal date, check if it has passed.
    const renewaldate = dayjs(subscription.renewaldate);

    if (!renewaldate.isBefore(dayjs())) {
      console.log("No subscriptions renewed.");
      continue;
    }     

    console.log(`Subscription ${subscription.name} is due for renewal...`)

    // Create messageObj
    const user = await User.findById(subscription.user);
    const messageObj = {
      chat: {
        id: user.telegramId
      }
    }

    // Update renewaldate
    const newRenewalDate = renewaldate.add(frequencies[subscription.frequency], 'day');
    await Subscription.updateOne({ _id: subscription._id }, { renewaldate: newRenewalDate });

    sendMessage(messageObj, `Your Subscription ${subscription.name} is due today! Your next payment is set to ${newRenewalDate.format('YYYY/MM/DD')}`);

    // Trigger new workflow? Is that right?
    await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows`,
      body: {
        messageObj: messageObj,
        subscriptionId: subscription._id,
      },
      headers: {
        'content-type': 'application/json',
      },
      retries: 0,
    });

  }

})

export const sendReminders = serve(async (context) => {

  console.log(`Running Send Reminders Workflow...`);
  console.log(context);

  const { messageObj, subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription) return;

  console.log(`Running REMINDERS loop...`);

  for (const daysBefore of REMINDERS) {

    console.log(`Day: ${daysBefore}}`);

    const renewaldate = dayjs(subscription.renewaldate);
    const reminderDate = renewaldate.subtract(daysBefore, 'day');

    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(context, `Sleeping until ${daysBefore} days reminder at ${reminderDate}`, reminderDate);
    }

    await triggerReminder(context, messageObj, `[REMINDER] Subscription ${subscription.name} is due in ${daysBefore} days.`);
  }

});

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, messageObj, label) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`);
    await sendMessage(messageObj, label);
  });
}

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run('get subscription', async () => {
    return await getUserSubscription(subscriptionId);
  })
}

const fetchAllSubscriptions = async (context) => {
  return await context.run('get all subscriptions', async () => {
    return await Subscription.find();
  })
}