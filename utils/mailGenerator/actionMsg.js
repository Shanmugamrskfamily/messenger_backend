import Mailgen from 'mailgen'

export const msgBody = (msg) =>{
    var mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Messenger Application',
            link: 'https://app.netlify.messengerapp/'
        }
    });

    var response = {
        body: {
            name: msg.name,
            intro: msg.intro,
            action: {
                instructions: msg.instructions,
                button: {
                    color: msg.color,
                    text: msg.text,
                    link: msg.link
                }
            },
            outro: msg.outro
        }
    };

    let message = mailGenerator.generate(response);

    return message;
};