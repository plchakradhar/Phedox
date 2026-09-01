package com.onlineoffers.mapper;

import com.onlineoffers.dto.CategoryResponse;
import com.onlineoffers.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        if (category == null) return null;
        CategoryResponse res = new CategoryResponse();
        res.setId(category.getId());
        res.setName(category.getName());
        res.setDescription(category.getDescription());
        res.setImageUrl(category.getImageUrl());
        res.setActive(category.getActive());
        return res;
    }
}
