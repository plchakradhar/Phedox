package com.onlineoffers.service;

import com.onlineoffers.dto.CategoryResponse;
import com.onlineoffers.entity.Category;
import com.onlineoffers.mapper.CategoryMapper;
import com.onlineoffers.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .map(categoryMapper::toResponse)
                .toList();
    }
}
