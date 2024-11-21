const sgMail = require('@sendgrid/mail');

module.exports = async function (context, req) {
    try {
        const { name, feedback } = req.body;
        
        if (!name || !feedback) {
            context.res = {
                status: 400,
                body: "Please provide both name and feedback"
            };
            return;
        }

        // Store in table
        context.bindings.feedbackTable = {
            PartitionKey: "Feedback",
            RowKey: new Date().getTime().toString(),
            name: name,
            feedback: feedback,
            timestamp: new Date().toISOString()
        };

        // Send email
        sgMail.setApiKey(process.env.sendgrid_api);
        const msg = {
            to: 'forcourses23@outlook.com',  // Your email
            from: 'forcourses23@outlook.com',  // Must be the verified sender
            subject: 'New Portfolio Website Feedback',
            text: `New feedback received!\n\nName: ${name}\nFeedback: ${feedback}`,
            html: `
                <h2>New feedback received!</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Feedback:</strong> ${feedback}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            `
        };
        
        await sgMail.send(msg);

        context.res = {
            status: 200,
            body: { message: "Feedback submitted successfully" }
        };
    } catch (error) {
        context.log.error('Error:', error);
        context.res = {
            status: 500,
            body: { error: "Error submitting feedback" }
        };
    }
};