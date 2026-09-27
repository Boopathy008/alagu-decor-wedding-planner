package com.alagu.decor.controller;

import com.alagu.decor.dto.ApiResponse;
import com.alagu.decor.dto.EnquiryDto;
import com.alagu.decor.service.EnquiryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/enquiries")
public class AdminEnquiryController {

    private final EnquiryService enquiryService;

    public AdminEnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    @GetMapping
    public ApiResponse<List<EnquiryDto>> getAll() {
        return ApiResponse.ok(enquiryService.getAll());
    }
}
