import { Logger } from "@nestjs/common"

export class SendSMS {
    /**
     * Appends mobile app download link to SMS content
     * @param content Original SMS content
     * @returns SMS content with app link appended
     */
    private static logger = new Logger(SendSMS.name)
    private static appendAppLink(content: string): string {
        const APP_LINK = "bit.ly/MEGAFREE"

        if (content.includes(APP_LINK)) {
            return content
        }

        let formattedContent = content.trim()
        const lastChar = formattedContent.charAt(formattedContent.length - 1)
        if (![".", ",", "!", "?", ":", ";"].includes(lastChar)) {
            formattedContent += "."
        }

        return `${formattedContent} - Get our Mobile App: ${APP_LINK}`
    }

    /**
     * FROM updigital
     */
    public static async sendMessageUpdigital(phone: string, content: string) {
        // Append mobile app link to SMS content
        content = SendSMS.appendAppLink(content)
        const { SMS_LIVE, SMS_FROM }: any = process.env

        if (phone.trim().startsWith("+")) phone = phone.replace("+", "")

        const from = SMS_FROM

        let response: any = null
        try {
            // Properly encode the content for URL parameters to preserve spaces and formatting
            const encodedContent = encodeURIComponent(content)

            const response_ = await fetch(
                `https://messaging.updigital-ng.com/smsapi/index?key=${SMS_LIVE}&campaign=106&routeid=1&type=text&contacts=${phone}&senderid=${from}&msg=${encodedContent}`
            )
            response = await response_.json()
        } catch (error) {
            SendSMS.logger.error("Updigital SMS service error", {
                component: "SendSMS",
                action: "sendSmsViaUpdigital",
                phone,
                error: error.message,
                stack: error.stack,
            })

            return { status: false, message: "SMS Updigital service invalid" }
        }

        let status = false
        let message = ""

        if (!response || response.result != "success") {
            status = false
            if (response.message) message = response.message
            else message = "An error occurred while sending SMS."
        } else {
            status = true
            message = "message successfully submitted for delivery"
        }

        return { status, message }
    }

    /**
     * FROM v2nmobile
     */
    public static async sendMessageV2N(phone: string, content: string) {
        // Append mobile app link to SMS content
        content = SendSMS.appendAppLink(content)
        const { SMS_V2N_EMAIL, SMS_V2N_PASSWORD, SMS_V2N_PHONE }: any = process.env

        if (phone.trim().startsWith("+")) phone = phone.replace("+", "")

        let response: any = null
        try {
            // Use encodeURIComponent for better handling of special characters
            const response_ = await fetch(
                `http://v2nmobile.com/api/httpsms.php?u=${encodeURIComponent(
                    SMS_V2N_EMAIL
                )}&p=${encodeURIComponent(SMS_V2N_PASSWORD)}&r=${encodeURIComponent(phone)}&s=${encodeURIComponent(
                    SMS_V2N_PHONE
                )}&m=${encodeURIComponent(content)}`
            )
            response = await response_.text()
        } catch (error) {
            SendSMS.logger.error("V2N SMS service error", {
                component: "SendSMS",
                action: "sendSmsViaV2N",
                phone,
                error: error.message,
                stack: error.stack,
            })

            return { status: false, message: "SMS V2N Mobile service invalid" }
        }

        let status = false
        let message = ""

        if (response) {
            if (response.substr(0, 2) == "00") {
                // SUCCESS
                status = true
                message = "message successfully submitted for delivery"
            } else {
                status = false
                const errorCode = response.substr(0, 2).trim()

                if (errorCode == "13") {
                    message = "MISSING RECIPEINT"
                } else if (errorCode == "14") {
                    message = "MISSING SENDER ID"
                } else if (errorCode == "15") {
                    message = "MISSING MESSAGE"
                } else if (errorCode == "21") {
                    message = "SENDER ID TOO LONG"
                } else if (errorCode == "22") {
                    message = "INVALID RECIPIENT"
                } else if (errorCode == "23") {
                    message = "INVALID MESSAGE"
                } else if (errorCode == "31") {
                    message = "INVALID USERNAME"
                } else if (errorCode == "32") {
                    message = "INVALID PASSWORD"
                } else if (errorCode == "33") {
                    message = "INVALID LOGIN"
                } else if (errorCode == "34") {
                    message = "ACCOUNT DISABLED"
                } else if (errorCode == "41") {
                    message = "INSUFFICIENT CREDIT"
                } else if (errorCode == "51") {
                    message = "GATEWAY UNREACHABLE"
                } else if (errorCode == "52") {
                    message = "SYSTEM ERROR"
                }
            }
        } else {
            status = false
            message = "gateway cannot be opened at the moment"
        }

        return { status, message }
    }

    /**
     * FROM blusalt OTP
     */
    public static async sendMessageBlusaltOTP(
        phone: string,
        countryCode: string
    ) {
        if (!countryCode) {
            return { status: false, message: "Country code invalid" }
        }

        const {
            APP_NAME,
            SMS_BLUESALT_OTP_CLIENT_ID,
            SMS_BLUESALT_OTP_APP_NAME,
            SMS_BLUESALT_OTP_API_KEY,
        }: any = process.env

        // console.log(`SMS_BLUESALT_OTP_CLIENT_ID: ${SMS_BLUESALT_OTP_CLIENT_ID}, SMS_BLUESALT_OTP_APP_NAME: ${SMS_BLUESALT_OTP_APP_NAME}, SMS_BLUESALT_OTP_API_KEY: ${SMS_BLUESALT_OTP_API_KEY}`);

        if (phone.trim().startsWith(countryCode))
            phone = phone.replace(countryCode, "")

        if (countryCode.trim().startsWith("+"))
            countryCode = countryCode.replace("+", "")

        const data = {
            phone_number: phone,
            expiry_time: "60",
            message: SendSMS.appendAppLink(
                `Verification Code from ${APP_NAME}: {code}`
            ),
            country_code: countryCode,
        }

        let response: any = null
        try {
            const response_ = await fetch("https://api.blusalt.net/v2/Otp/send", {
                method: "post",
                body: JSON.stringify(data),
                headers: {
                    clientid: SMS_BLUESALT_OTP_CLIENT_ID,
                    appname: SMS_BLUESALT_OTP_APP_NAME,
                    apikey: SMS_BLUESALT_OTP_API_KEY,
                    "Content-Type": "application/json",
                },
            })
            response = await response_.json()
        } catch (error) {
            SendSMS.logger.error("Blusalt OTP SMS service error", {
                component: "SendSMS",
                action: "sendOtpViaBlusalt",
                phone,
                error: error.message,
                stack: error.stack,
            })

            return { status: false, message: "SMS Blusalt Otp service invalid" }
        }

        if (!response || !response.status_code) {
            return { status: false, message: "SMS Blusalt service invalid" }
        }

        if (response.status_code === 200) {
            return { status: true, message: response.message }
        } else {
            return { status: false, message: response.message }
        }
    }

    /**
     * FROM vanso for USSD OTP
     */
    public static async sendMessageVanso(phone: string, content: string) {
        // Append mobile app link to SMS content
        content = SendSMS.appendAppLink(content)
        const {
            SMS_VANSO_SYSTEM_ID,
            SMS_VANSO_PASSWORD,
            SMS_VANSO_SOURCE_ADDRESS,
        }: any = process.env

        if (phone.trim().startsWith("+")) phone = phone.replace("+", "")

        // Create a clearer separation between message and app link
        const messageText = content

        const data = {
            sms: {
                dest: phone,
                src: SMS_VANSO_SOURCE_ADDRESS,
                text: messageText,
            },
            account: {
                systemId: SMS_VANSO_SYSTEM_ID,
                password: SMS_VANSO_PASSWORD,
            },
        }

        const bufferObj = Buffer.from(
            `${SMS_VANSO_SYSTEM_ID}:${SMS_VANSO_PASSWORD}`,
            "utf8"
        )
        const base64Str = bufferObj.toString("base64")

        let response: any = null
        try {
            const response_ = await fetch("https://sms.vanso.com/rest/sms/submit", {
                method: "post",
                body: JSON.stringify(data),
                headers: {
                    Authorization: `Basic ${base64Str}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            })
            response = await response_.json()
        } catch (error) {
            SendSMS.logger.error("Vanso SMS service error", {
                component: "SendSMS",
                action: "sendSmsViaVanso",
                phone,
                error: error.message,
                stack: error.stack,
            })

            return { status: false, message: "SMS vanso service invalid" }
        }

        SendSMS.logger.debug("Vanso SMS response received", {
            component: "SendSMS",
            action: "sendSmsViaVanso",
            phone,
            responseStatus: response?.status || "unknown",
        })

        if (!response) {
            return { status: false, message: "SMS vanso service invalid" }
        }

        if (response.errorCode === 0) {
            return { status: true, message: response.status }
        } else {
            return { status: false, message: response.errorMessage }
        }
    }
}

export default SendSMS
