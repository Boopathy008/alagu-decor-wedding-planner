package com.alagu.decor.service;

import com.alagu.decor.dto.EnquiryDto;
import com.alagu.decor.dto.EnquiryRequest;
import com.alagu.decor.entity.Enquiry;
import com.alagu.decor.repository.EnquiryRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;

    public EnquiryService(EnquiryRepository enquiryRepository) {
        this.enquiryRepository = enquiryRepository;
    }

    public EnquiryDto submit(EnquiryRequest request) {
        Enquiry enquiry = new Enquiry();
        enquiry.setName(request.name().trim());
        enquiry.setPhone(request.phone().trim());
        enquiry.setEmail(request.email().trim());
        enquiry.setEventType(request.eventType().trim());
        enquiry.setEventDate(request.eventDate());
        enquiry.setLocation(request.location().trim());
        enquiry.setGuestCount(request.guestCount());
        enquiry.setServices(
                request.servicesInterested() == null ? "" : String.join(",", request.servicesInterested())
        );
        enquiry.setMessage(request.message());
        return toDto(enquiryRepository.save(enquiry));
    }

    public List<EnquiryDto> getAll() {
        return enquiryRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<EnquiryDto> getRecent(int limit) {
        return enquiryRepository.findAllByOrderByCreatedAtDesc()
                .stream().limit(limit).map(this::toDto).collect(Collectors.toList());
    }

    public long countAll() {
        return enquiryRepository.count();
    }

    private EnquiryDto toDto(Enquiry e) {
        List<String> services = (e.getServices() == null || e.getServices().isBlank())
                ? List.of()
                : Arrays.asList(e.getServices().split(","));
        return new EnquiryDto(
                e.getId(), e.getName(), e.getPhone(), e.getEmail(), e.getEventType(),
                e.getEventDate(), e.getLocation(), e.getGuestCount(), services,
                e.getMessage(), e.getCreatedAt(), e.getStatus()
        );
    }
}
