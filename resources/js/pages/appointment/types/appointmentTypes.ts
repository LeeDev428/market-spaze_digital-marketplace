export interface VendorStore {
    id: number;
    business_name: string;
    description: string;
    business_type: 'products' | 'services';
    address: string;
    contact_phone: string;
    contact_email: string;
    logo_path: string | null;
    serviceable_areas: string[];
    products_services: Service[];
    rating?: number;
    total_reviews?: number;
    verified?: boolean;
    response_time?: string;
    completion_rate?: number;
    years_experience?: number;
    specializations?: string[];
    certifications?: string[];
    working_hours?: {
        [key: string]: { open: string; close: string; closed?: boolean };
    };
    gallery_images?: string[];
    instant_booking?: boolean;
    home_service?: boolean;
}

export interface Service {
    id: number;
    vendor_store_id: number;
    name: string;
    description: string;
    price_min: number;
    price_max: number;
    is_active: boolean;
    duration_minutes?: number;
    category?: string;
    requirements?: string[];
    includes?: string[];
    preparation_instructions?: string;
    cancellation_policy?: string;
    image_path?: string;
    popular?: boolean;
    discount_percentage?: number;
}
