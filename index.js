const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

const wallets = {};
const OWNER_ID = '837208487548944416';  // Replace this with your actual Discord user ID

// Function to get the balance of a user
function getBalance(userId) {
    if (!wallets[userId]) {
        wallets[userId] = 100;  // Starting balance
    }
    return wallets[userId];
}

// Function to update the balance of a user
function updateBalance(userId, amount) {
    if (!wallets[userId]) {
        wallets[userId] = 100;  // Starting balance
    }
    wallets[userId] += amount;
}

// Function to set the balance of a user
function setBalance(userId, amount) {
    wallets[userId] = amount;
}

// When the bot is ready
client.once('ready', () => {
    console.log('Bot is online!');
});

// Listen for messages
client.on('messageCreate', async message => {
    // Ignore messages from the bot itself
    if (message.author.bot) return;

    // Command: fcash
    if (message.content === 'fcash') {
        const balance = getBalance(message.author.id);
        message.channel.send(`You have ${balance} Cruncy coins.`);
    }

    // Command: fcf <amount>
    if (message.content.startsWith('fcf ')) {
        const amount = parseInt(message.content.split(' ')[1]);
        const userId = message.author.id;

        if (isNaN(amount) || amount <= 0) {
            message.channel.send('Please enter a valid amount.');
            return;
        }

        const balance = getBalance(userId);
        if (balance < amount) {
            message.channel.send('You do not have enough Cruncy coins.');
            return;
        }

        // Deduct the amount for the bet
        updateBalance(userId, -amount);

        const flipMessage = await message.channel.send(`Flipping a coin for ${amount} Cruncy coins...`);
        setTimeout(() => {
            const win = Math.random() < 0.5;
            if (win) {
                updateBalance(userId, amount * 2);
                flipMessage.edit(`You won! Your new balance is ${getBalance(userId)} Cruncy coins.`);
            } else {
                flipMessage.edit(`You lost! Your new balance is ${getBalance(userId)} Cruncy coins.`);
            }
        }, 3000);
    }

    // Command: fcsetbalance <user_id> <amount>
    if (message.content.startsWith('fcsetbalance ')) {
        const args = message.content.split(' ');
        const targetUserId = args[1];
        const amount = parseInt(args[2]);

        if (message.author.id !== OWNER_ID) {
            message.channel.send('You do not have permission to use this command.');
            return;
        }

        if (!targetUserId || isNaN(amount) || amount < 0) {
            message.channel.send('Please enter a valid user ID and amount.');
            return;
        }

        setBalance(targetUserId, amount);
        message.channel.send(`Set balance of user ${targetUserId} to ${amount} Cruncy coins.`);
    }

    // Command: fcgive <username> <amount>
    if (message.content.startsWith('fcgive ')) {
        const args = message.content.split(' ');
        const username = args[1];
        const amount = parseInt(args[2]);

        if (!username || isNaN(amount) || amount <= 0) {
            message.channel.send('Please enter a valid username and amount.');
            return;
        }

        const targetUser = message.guild.members.cache.find(member => member.user.username === username);
        if (!targetUser) {
            message.channel.send('User not found.');
            return;
        }

        const senderId = message.author.id;
        const receiverId = targetUser.user.id;

        const senderBalance = getBalance(senderId);
        if (senderBalance < amount) {
            message.channel.send('You do not have enough Cruncy coins.');
            return;
        }

        updateBalance(senderId, -amount);
        updateBalance(receiverId, amount);

        message.channel.send(`Transferred ${amount} Cruncy coins to ${username}. Your new balance is ${getBalance(senderId)} Cruncy coins.`);
    }
});

// Login to Discord with your app's token
client.login('YOUR_');
