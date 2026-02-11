package com.company.admin.admin_backend.Service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.phone.number}")
    private String fromNumber;

    public void sendOtp(String toMobile, String otp) {
        Message.creator(
                new PhoneNumber(toMobile),   //verfied user number in twillo
                new PhoneNumber(fromNumber), // twillo buy number
                "Your OTP for password reset is: " + otp
        ).create();
    }
}
