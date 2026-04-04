# Poultry 360 ERP - API Testing Guide

This file contains the details required to test the API endpoints, including authentication and sample payloads.

---

## 1. Authentication (JWT)

All endpoints (except Login) require a Bearer Token in the `Authorization` header.

### **Get Token**
*   **Endpoint:** `POST /api/Auth/login`
*   **Payload:**
    ```json
    {
      "username": "admin",
      "password": "password123"
    }
    ```
*   **Response:**
    ```json
    {
      "token": "eyJhbGci..."
    }
    ```

---

## 2. Flock Module

### **Get All Flocks**
*   **Endpoint:** `GET /api/Flocks`
*   **Header:** `Authorization: Bearer {token}`

### **Get Flock by ID**
*   **Endpoint:** `GET /api/Flocks/1`
*   **Header:** `Authorization: Bearer {token}`

### **Create New Flock**
*   **Endpoint:** `POST /api/Flocks`
*   **Header:** `Authorization: Bearer {token}`
*   **Payload:**
    ```json
    {
      "breed": "Sussex",
      "initialCount": 200,
      "currentCount": 200,
      "arrivalDate": "2024-03-07T00:00:00Z",
      "status": "Active"
    }
    ```

### **Update Flock**
*   **Endpoint:** `PUT /api/Flocks/1`
*   **Header:** `Authorization: Bearer {token}`
*   **Payload:**
    ```json
    {
      "id": 1,
      "breed": "Rhode Island Red",
      "initialCount": 1000,
      "currentCount": 985,
      "arrivalDate": "2024-02-01T00:00:00Z",
      "status": "Active"
    }
    ```

### **Delete Flock**
*   **Endpoint:** `DELETE /api/Flocks/1`
*   **Header:** `Authorization: Bearer {token}`

---

## 3. Dashboard

### **Get Dashboard Summary**
*   **Endpoint:** `GET /api/Dashboard`
*   **Header:** `Authorization: Bearer {token}`

---

*Last Updated: 2026-03-07*

---

## 4. UI Progress

*   **Dashboard:** Completed with charts and metrics.
*   **Flock Management:** Completed with List, Add, Edit, and Delete functionality.
*   **Authentication:** Completed with Login page and JWT persistence.
*   **Inventory/Sales/Expenses:** Placeholders ready for backend integration.
