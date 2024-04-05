import * as dotenv from "dotenv";
import * as qs from "qs";
import { Telegraf } from "telegraf";
import { beginCell } from "@ton/core";
import { toNano } from "ton-core";

dotenv.config();
const bot = new Telegraf(process.env.TG_BOT_TOKEN!);

bot.start((ctx) =>
    ctx.reply("Welcome to earnplaying.org app!", {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "How it works",
                        callback_data: "how_it_works_command",
                    },
                    {
                        text: "Place a bet",
                        callback_data: "place_bet_command",
                    },
                ],
            ],
        },
    })
);

bot.action("how_it_works_command", (ctx) =>
    ctx.replyWithHTML(
        "<b>How it works:</b>\n\n" +
            "<b>Place your bet.</b> 🎲 The higher your bet, the higher your chance of winning.\n\n" +
            "<b>Wait for the required number of transactions</b> ⏳ in the current round or place new bets.\n\n" +
            "<b>The winner will be selected</b> 🏆 once the required number of transactions is received.\n\n" +
            "<b>The smart contract automatically transfers the award</b> 💰 to the winner's wallet."
    )
);

bot.action("place_bet_command", (ctx) => {
    ctx.replyWithHTML(`
    <b>The higher your bet, the higher your chance of winning. 🏆🎲</b>\n\nPlease enter a number between <b>1</b> and <b>100 TON</b> to place your bet:`);

    // Listen for text messages
    bot.on("text", (ctx) => {
        const userInput = ctx.message.text.trim();

        // Check if the input is a number between 1 and 100 or an action button
        if (parseInt(userInput) >= 1 && parseInt(userInput) <= 100) {
            const msg_body = beginCell().storeUint(1, 4).endCell();

            let link = `ton://transfer/EQCgcmiMffDhYuf3dvGheCLahpin49eLSIa9AtIdOWbcr55T?${qs.stringify({
                text: `Bet ${userInput} TON`,
                amount: toNano(userInput).toString(10),
                payload: msg_body.toBoc().toString("base64"),
            })}`;

            ctx.reply(`Ready to place your bet? Just sign the transaction below:`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Sign transaction",
                                url: link,
                            },
                        ],
                    ],
                },
            });
        } else {
            ctx.reply("Oops! Please enter a valid number between 1 and 100 TON to place your bet. 🤔");
        }
    });
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
