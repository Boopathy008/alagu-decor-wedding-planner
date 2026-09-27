package com.alagu.decor.controller;

import com.alagu.decor.dto.ApiResponse;
import com.alagu.decor.dto.EnquiryDto;
import com.alagu.decor.dto.EnquiryRequest;
import com.alagu.decor.service.EnquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    private final EnquiryService enquiryService;

    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EnquiryDto> submit(@Valid @RequestBody EnquiryRequest request) {
        return ApiResponse.ok("Enquiry submitted successfully", enquiryService.submit(request));
    }
}
