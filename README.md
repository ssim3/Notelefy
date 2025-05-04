# Subscriber

![Subscriber Logo](https://github.com/ssim3/Subscriber/blob/main/Subscriber(3).png) <!-- Add your logo here -->

Subscriber is your all-in-one Telegram Bot to help you effortlessly manage your subscriptions.

## Try It Out

You can test the bot directly on Telegram:
👉 [https://web.telegram.org/k/#@subscriber_v1_bot](https://web.telegram.org/k/#@subscriber_v1_bot)

Simply start a chat with the bot using the <i>/start</i> command and follow the instructions to track your subscriptions!

## Features

- 📅 Automatically tracks subscription renewal dates
- 🔔 Get telegram reminders before subscriptions renew
- 💰 Monitor subscription costs
- 📊 View all subscriptions in one place
- 🔐 Secure user authentication

## Technologies Used

- **Backend**: Node.js, Express.js for API routes
- **Database**: MongoDB (with Mongoose ODM)
- **Security**: Arcjet for rate limiting and protection
- **Scheduling**: Upstash for workflow scheduling and reminders
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js (v20.14.0 or higher)
- MongoDB Atlas or local MongoDB instance
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Docker (for containerized deployment)
- Arcjet Project
- Upstash Account 

### Installation

1. Clone the repository:
```bash
   git clone https://github.com/yourusername/notelefy.git
   cd notelefy
```
2. Install Dependencies
```bash
   npm install
```
3. Set up environment variables: Create .env.development.local or .env.production.local with the following variables:
```bash
PORT=5500
DB_URI=mongodb://your-mongodb-uri
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
ARCJET_KEY=your-arcjet-key
SERVER_URL=your-server-url
```
4. Running the project locally
```bash
# Development
npm run dev

# Production
npm start
```
5. Docker Deployment
Build and run with Docker:
```bash
docker compose up --build
```

Your application will be available at http://localhost:5500.

## Contributions
Contributions are very much welcome. There are several issues that you may come across while running the code that I am currently working hard to solve, do submit a pull request or open an issue if you encounter one of these bugs!
