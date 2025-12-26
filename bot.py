from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# NOTE: You need to install python-telegram-bot
# pip install python-telegram-bot

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # IMPORTANT: Replace with your actual deployed URL (e.g., Vercel) or a local tunnel URL (ngrok)
    # Telegram requires HTTPS
    web_app_url = "https://vocab-builder-iota.vercel.app/" # Placeholder, change this after deployment
    
    keyboard = [
        [InlineKeyboardButton("Open App", web_app=WebAppInfo(url=web_app_url))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text("Salom! Ilovani ochish uchun tugmani bosing:", reply_markup=reply_markup)

if __name__ == '__main__':
    # REPLACE WITH YOUR BOT TOKEN
    BOT_TOKEN = "8518698681:AAERVzdSX_9-HkSy9QjZzc_2iIY79QtoKXA"
    
    print("Bot ishga tushdi...")
    try:
        app = ApplicationBuilder().token(BOT_TOKEN).build()
        app.add_handler(CommandHandler("start", start))
        app.run_polling()
    except Exception as e:
        print(f"Xatolik: {e}")
        print("Bot tokenini kiritganingizga ishonch hosil qiling.")
