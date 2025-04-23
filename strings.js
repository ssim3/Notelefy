export const startMessage = `
Here are the commands you can use:

/start - Registers your telegram account.
/subscriptions - View all your subscriptions.
/add - Add a new subscription.
/edit - Update existing subscription.
/delete - Remove a subscription.

No more surprises. Just smarter subscriptions. 💸
`;

export const underfinedMessage = "What you saying bruv.\n" + startMessage

export const editSubscriptionInstructionStepOne = `
<b>Let's modify a subscription! 🎉</b>
Enter the <b>number</b> of the subscription you want to modify:\n
`

export const editSubscriptionInstructionStepTwo = `
To update your subscription, send the new details in this format:

field - [new value]  

<b>Example:</b>  
name - Disney+  
price - 12.99  
currency - USD, EUR, GBP, SGD

<b>Note:</b> To modify the <i>renewaldate</i> or <i>frequency</i>, please delete the subscription and create a new one to keep renewal tracking accurate.
`

export const deleteSubscriptionInstructionStepOne = `
<b>About time your broke ass saved some money 🎉</b>
Enter the <b>number</b> of the subscription you want to delete:\n
`

export const deleteSubscriptionInstructionStepTwo = `
To confirm deletion, reply with "yes".  
This will permanently remove the subscription from your list.
`

export const createSubscriptionInstruction = `
<b>Let's add a new subscription! 📝</b>
Send all the details in one message using this format:

name - Name of subscription  
price - Cost (e.g., 12.99)  
currency - USD, EUR, GBP, SGD  
frequency - daily, weekly, monthly, yearly  
renewaldate - YYYY/MM/DD

<b>Example ⬇️</b>  
name - Disney+  
price - 12.99  
currency - USD  
frequency - monthly  
renewaldate - 2025/04/23

✅ I'll save it and track your renewal date automatically!
`

export const createSubscriptionErrorInstruction = `
That's an invalid format!

Please send your subscription details in this format:

name - (e.g., Netflix, Spotify)
price - (e.g., 15.99)
currency - [USD, EUR, GBP, SGD]
frequency - [daily, weekly, monthly, yearly]
start - (Format: YYYY-MM-DD)

Once I have all the details, I'll save your subscription and calculate the renewal date for you automatically! ✅
`

export const formatSubscriptions = (subscription) => {
  const { name, price, currency, renewaldate } = subscription;
  const formattedDetails = `<b>${name}</b>\n💰 ${currency}${price.toFixed(2)}\n📅 Next billing: ${renewaldate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`;

  return formattedDetails;
}
