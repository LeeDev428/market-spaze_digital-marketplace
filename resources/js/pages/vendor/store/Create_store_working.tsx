import { useState } from 'react';
import { router } from '@inertiajs/react';
import VendorLayout from '../../../layouts/app/VendorLayout';
import { 
    Building2, 
    Package, 
    ShoppingBag, 
    Upload, 
    Plus, 
    Trash2, 
    Save,
    ArrowRight,
    CheckCircle,
    ArrowLeft,
    Clock,
    Percent,
    Shield,
    Truck,
    Home,
    Star,
    Zap,
    Tag,
    Image,
    X,
    Gift,
    AlertCircle
} from 'lucide-react';

interface ProductService {
    id: string;
    name: string;
    description: string;
    category: string;
    priceMin: string;
    priceMax: string;
    durationMinutes: string;
    discountPercentage: string;
    isPopular: boolean;
    isGuaranteed: boolean;
    isProfessional: boolean;
    responseTime: string;
    includes: string;
    requirements: string;
    hasWarranty: boolean;
    warrantyDays: string;
    pickupAvailable: boolean;
    deliveryAvailable: boolean;
    emergencyService: boolean;
    specialInstructions: string;
    tags: string;
    images: File[];
}

export default function CreateStore() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<any>({});
    
    // Form state for STORE information only
    const [formData, setFormData] = useState({
        businessName: '',
        description: '',
        businessType: '' as 'products' | 'services' | '',
        address: '',
        serviceableAreas: [''],
        contactPhone: '',
        contactEmail: '',
        serviceDescription: '',
        logo: null as File | null,
    });
    
    // Form state for INDIVIDUAL PRODUCTS/SERVICES with ALL database fields
    const [productServices, setProductServices] = useState<ProductService[]>([
        { 
            id: '1', 
            name: '', 
            description: '', 
            category: '',
            priceMin: '', 
            priceMax: '',
            durationMinutes: '',
            discountPercentage: '',
            isPopular: false,
            isGuaranteed: true,
            isProfessional: true,
            responseTime: '',
            includes: '',
            requirements: '',
            hasWarranty: false,
            warrantyDays: '',
            pickupAvailable: false,
            deliveryAvailable: false,
            emergencyService: false,
            specialInstructions: '',
            tags: '',
            images: []
        }
    ]);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleServiceableAreaChange = (index: number, value: string) => {
        const newAreas = [...formData.serviceableAreas];
        newAreas[index] = value;
        setFormData(prev => ({
            ...prev,
            serviceableAreas: newAreas
        }));
    };

    const addServiceableArea = () => {
        const newAreas = [...formData.serviceableAreas, ''];
        setFormData(prev => ({
            ...prev,
            serviceableAreas: newAreas
        }));
    };

    const removeServiceableArea = (index: number) => {
        const newAreas = formData.serviceableAreas.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            serviceableAreas: newAreas
        }));
    };

    const handleProductServiceChange = (id: string, field: string, value: string | boolean) => {
        const updatedServices = productServices.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        setProductServices(updatedServices);
    };

    const handleProductServiceImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const updatedServices = productServices.map(item => 
            item.id === id ? { ...item, images: [...item.images, ...files] } : item
        );
        setProductServices(updatedServices);
    };

    const removeProductServiceImage = (id: string, imageIndex: number) => {
        const updatedServices = productServices.map(item => 
            item.id === id ? { 
                ...item, 
                images: item.images.filter((_, index) => index !== imageIndex) 
            } : item
        );
        setProductServices(updatedServices);
    };

    const addProductService = () => {
        const newId = Date.now().toString();
        const newServices = [
            ...productServices,
            { 
                id: newId, 
                name: '', 
                description: '', 
                category: '',
                priceMin: '', 
                priceMax: '',
                durationMinutes: '',
                discountPercentage: '',
                isPopular: false,
                isGuaranteed: true,
                isProfessional: true,
                responseTime: '',
                includes: '',
                requirements: '',
                hasWarranty: false,
                warrantyDays: '',
                pickupAvailable: false,
                deliveryAvailable: false,
                emergencyService: false,
                specialInstructions: '',
                tags: '',
                images: []
            }
        ];
        setProductServices(newServices);
    };

    const removeProductService = (id: string) => {
        const newServices = productServices.filter(item => item.id !== id);
        setProductServices(newServices);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, logo: file }));
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        
        try {
            // Create FormData for file uploads
            const formDataObj = new FormData();
            
            // Add basic store info
            formDataObj.append('businessName', formData.businessName);
            formDataObj.append('description', formData.description);
            formDataObj.append('businessType', formData.businessType);
            formDataObj.append('address', formData.address);
            formDataObj.append('contactPhone', formData.contactPhone);
            formDataObj.append('contactEmail', formData.contactEmail);
            formDataObj.append('serviceDescription', formData.serviceDescription || '');
            
            // Add serviceable areas
            formData.serviceableAreas.filter(area => area.trim() !== '').forEach((area, index) => {
                formDataObj.append(`serviceableAreas[${index}]`, area);
            });
            
            // Add logo if exists
            if (formData.logo) {
                formDataObj.append('logo', formData.logo);
            }
            
            // Add products/services with all fields and images
            const validServices = productServices.filter(item => item.name.trim() !== '');
            validServices.forEach((item, index) => {
                formDataObj.append(`productServices[${index}][name]`, item.name);
                formDataObj.append(`productServices[${index}][description]`, item.description);
                formDataObj.append(`productServices[${index}][category]`, item.category);
                formDataObj.append(`productServices[${index}][priceMin]`, item.priceMin);
                formDataObj.append(`productServices[${index}][priceMax]`, item.priceMax);
                formDataObj.append(`productServices[${index}][durationMinutes]`, item.durationMinutes || '');
                formDataObj.append(`productServices[${index}][discountPercentage]`, item.discountPercentage || '0');
                formDataObj.append(`productServices[${index}][responseTime]`, item.responseTime || '');
                formDataObj.append(`productServices[${index}][includes]`, item.includes || '');
                formDataObj.append(`productServices[${index}][requirements]`, item.requirements || '');
                formDataObj.append(`productServices[${index}][tags]`, item.tags || '');
                formDataObj.append(`productServices[${index}][specialInstructions]`, item.specialInstructions || '');
                formDataObj.append(`productServices[${index}][warrantyDays]`, item.warrantyDays || '');
                
                // Boolean fields
                formDataObj.append(`productServices[${index}][isPopular]`, item.isPopular ? '1' : '0');
                formDataObj.append(`productServices[${index}][isGuaranteed]`, item.isGuaranteed ? '1' : '0');
                formDataObj.append(`productServices[${index}][isProfessional]`, item.isProfessional ? '1' : '0');
                formDataObj.append(`productServices[${index}][hasWarranty]`, item.hasWarranty ? '1' : '0');
                formDataObj.append(`productServices[${index}][pickupAvailable]`, item.pickupAvailable ? '1' : '0');
                formDataObj.append(`productServices[${index}][deliveryAvailable]`, item.deliveryAvailable ? '1' : '0');
                formDataObj.append(`productServices[${index}][emergencyService]`, item.emergencyService ? '1' : '0');
                
                // Add images
                item.images.forEach((image, imageIndex) => {
                    formDataObj.append(`productServices[${index}][images][${imageIndex}]`, image);
                });
            });

            // Submit with router
            router.post('/vendor/store', formDataObj, {
                forceFormData: true,
                onSuccess: () => {
                    console.log('Store created successfully!');
                },
                onError: (errors) => {
                    setErrors(errors);
                    console.error('Creation failed:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });

        } catch (error) {
            console.error('Submit error:', error);
            setIsSubmitting(false);
        }
    };

    const stepTitles = [
        'Store Information',
        'Product/Service Details',
        'Advanced Features',
        'Contact & Review'
    ];

    const serviceCategories = [
        'Home Services',
        'Beauty & Wellness',
        'Professional Services',
        'Automotive',
        'Technology',
        'Health & Medical',
        'Education & Training',
        'Event Services',
        'Business Services',
        'Electronics & Technology',
        'Other'
    ];

    const responseTimeOptions = [
        'Within 1 hour',
        'Within 2 hours',
        'Within 4 hours',
        'Same day',
        '1-2 business days',
        '3-5 business days',
        '1 week',
        'Custom timing'
    ];

    return (
        <VendorLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Create New Store
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Set up your business store and add your products/services with comprehensive details
                            </p>
                        </div>
                    </div>
                </div>

                {/* Display Errors */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">Please fix the following errors:</h3>
                        <ul className="text-red-700 dark:text-red-300 text-sm list-disc list-inside">
                            {Object.entries(errors).map(([key, message]) => (
                                <li key={key}>{Array.isArray(message) ? message[0] : message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {stepTitles.map((title, index) => (
                            <div key={index} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                    currentStep > index + 1 
                                        ? 'bg-green-500 border-green-500 text-white' 
                                        : currentStep === index + 1
                                        ? 'bg-orange-500 border-orange-500 text-white'
                                        : 'border-slate-300 text-slate-400'
                                }`}>
                                    {currentStep > index + 1 ? <CheckCircle size={20} /> : index + 1}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${
                                    currentStep >= index + 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                                }`}>
                                    {title}
                                </span>
                                {index < stepTitles.length - 1 && (
                                    <div className={`mx-4 h-0.5 w-16 ${
                                        currentStep > index + 1 ? 'bg-green-500' : 'bg-slate-300'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
                        {/* Step 1: Store Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Building2 className="text-orange-500" size={24} />
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                        Store Information
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Basic business details for your store
                                    </p>
                                </div>

                                {/* Business Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Business/Store Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.businessName}
                                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="e.g., Tech Repair Hub, Beauty Salon, Home Services"
                                        required
                                    />
                                    {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Store Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="Brief description of your store/business"
                                        required
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                </div>

                                {/* Business Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                        Business Type *
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            onClick={() => handleInputChange('businessType', 'products')}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                formData.businessType === 'products'
                                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Package className="text-orange-500" size={24} />
                                                <div>
                                                    <h3 className="font-medium text-slate-900 dark:text-white">Products</h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        Sell physical products
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => handleInputChange('businessType', 'services')}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                formData.businessType === 'services'
                                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <ShoppingBag className="text-orange-500" size={24} />
                                                <div>
                                                    <h3 className="font-medium text-slate-900 dark:text-white">Services</h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        Offer services to customers
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
                                </div>

                                {/* Address & Logo Upload */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Business Address *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                            placeholder="Enter your business address"
                                            required
                                        />
                                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Store Logo
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <label className="flex-1 p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center cursor-pointer hover:border-orange-500 transition-colors">
                                                <Upload className="mx-auto text-slate-400 mb-1" size={20} />
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    Upload Logo
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            {logoPreview && (
                                                <div className="w-16 h-16 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Product/Service Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    {formData.businessType === 'products' ? (
                                        <Package className="text-orange-500" size={24} />
                                    ) : (
                                        <ShoppingBag className="text-orange-500" size={24} />
                                    )}
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                            {formData.businessType === 'products' ? 'Product' : 'Service'} Details
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Add detailed information for each {formData.businessType === 'products' ? 'product' : 'service'} you offer
                                        </p>
                                    </div>
                                </div>

                                {productServices.map((item, index) => (
                                    <div key={item.id} className="border-2 border-slate-200 dark:border-slate-600 rounded-xl p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                                                {formData.businessType === 'products' ? 'Product' : 'Service'} #{index + 1}
                                            </h3>
                                            {productServices.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeProductService(item.id)}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Basic Information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    {formData.businessType === 'products' ? 'Product' : 'Service'} Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'name', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder={`Enter ${formData.businessType === 'products' ? 'product' : 'service'} name`}
                                                    required
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Description *
                                                </label>
                                                <textarea
                                                    value={item.description}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'description', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder={`Detailed description of your ${formData.businessType === 'products' ? 'product' : 'service'}`}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Category *
                                                </label>
                                                <select
                                                    value={item.category}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'category', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    required
                                                >
                                                    <option value="">Select Category</option>
                                                    {serviceCategories.map(category => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Clock className="inline mr-1" size={16} />
                                                    Duration (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.durationMinutes}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'durationMinutes', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="Estimated duration"
                                                    min="0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Minimum Price (₱) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.priceMin}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'priceMin', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Maximum Price (₱) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.priceMax}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'priceMax', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="0"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                                <Image className="inline mr-1" size={16} />
                                                {formData.businessType === 'products' ? 'Product' : 'Service'} Images
                                            </label>
                                            <div className="space-y-3">
                                                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                                                    <div className="text-center">
                                                        <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                                            Upload Images (Multiple allowed)
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={(e) => handleProductServiceImageUpload(item.id, e)}
                                                        className="hidden"
                                                    />
                                                </label>
                                                
                                                {/* Image Preview */}
                                                {item.images.length > 0 && (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {item.images.map((image, imageIndex) => (
                                                            <div key={imageIndex} className="relative">
                                                                <img
                                                                    src={URL.createObjectURL(image)}
                                                                    alt={`Preview ${imageIndex + 1}`}
                                                                    className="w-full h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeProductServiceImage(item.id, imageIndex)}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addProductService}
                                    className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Plus size={20} />
                                    <span>Add Another {formData.businessType === 'products' ? 'Product' : 'Service'}</span>
                                </button>
                            </div>
                        )}

                        {/* Step 3: Advanced Features */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Star className="text-orange-500" size={24} />
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                            Advanced Features & Details
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Configure advanced options for each {formData.businessType === 'products' ? 'product' : 'service'}
                                        </p>
                                    </div>
                                </div>

                                {productServices.map((item, index) => (
                                    <div key={item.id} className="border-2 border-slate-200 dark:border-slate-600 rounded-xl p-6 space-y-6">
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                                            {item.name || `${formData.businessType === 'products' ? 'Product' : 'Service'} #${index + 1}`}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Response Time & Discount */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Clock className="inline mr-1" size={16} />
                                                    Response Time
                                                </label>
                                                <select
                                                    value={item.responseTime}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'responseTime', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                >
                                                    <option value="">Select Response Time</option>
                                                    {responseTimeOptions.map(time => (
                                                        <option key={time} value={time}>{time}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Percent className="inline mr-1" size={16} />
                                                    Discount (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.discountPercentage}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'discountPercentage', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="0"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>

                                            {/* Feature Toggles */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                                    Service Features
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    <label className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.isPopular}
                                                            onChange={(e) => handleProductServiceChange(item.id, 'isPopular', e.target.checked)}
                                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                                        />
                                                        <Star className="text-slate-400" size={16} />
                                                        <span className="text-slate-700 dark:text-slate-300">Popular Choice</span>
                                                    </label>
                                                    <label className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.isGuaranteed}
                                                            onChange={(e) => handleProductServiceChange(item.id, 'isGuaranteed', e.target.checked)}
                                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                                        />
                                                        <Shield className="text-slate-400" size={16} />
                                                        <span className="text-slate-700 dark:text-slate-300">Guaranteed</span>
                                                    </label>
                                                    <label className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.isProfessional}
                                                            onChange={(e) => handleProductServiceChange(item.id, 'isProfessional', e.target.checked)}
                                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                                        />
                                                        <CheckCircle className="text-slate-400" size={16} />
                                                        <span className="text-slate-700 dark:text-slate-300">Professional</span>
                                                    </label>
                                                    <label className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.pickupAvailable}
                                                            onChange={(e) => handleProductServiceChange(item.id, 'pickupAvailable', e.target.checked)}
                                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                                        />
                                                        <Home className="text-slate-400" size={16} />
                                                        <span className="text-slate-700 dark:text-slate-300">Pickup Available</span>
                                                    </label>
                                                    <label className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.deliveryAvailable}
                                                            onChange={(e) => handleProductServiceChange(item.id, 'deliveryAvailable', e.target.checked)}
                                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                                        />
                                                        <Truck className="text-slate-400" size={16} />
                                                        <span className="text-slate-700 dark:text-slate-300">Delivery Available</span>
                                                    </label>
                                                    <label className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.emergencyService}
                                                            onChange={(e) => handleProductServiceChange(item.id, 'emergencyService', e.target.checked)}
                                                            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                                        />
                                                        <Zap className="text-slate-400" size={16} />
                                                        <span className="text-slate-700 dark:text-slate-300">Emergency Service</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Warranty Section */}
                                            <div className="md:col-span-2">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.hasWarranty}
                                                        onChange={(e) => handleProductServiceChange(item.id, 'hasWarranty', e.target.checked)}
                                                        className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                                    />
                                                    <Shield className="text-slate-400" size={16} />
                                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Warranty Available
                                                    </label>
                                                </div>
                                                {item.hasWarranty && (
                                                    <input
                                                        type="number"
                                                        value={item.warrantyDays}
                                                        onChange={(e) => handleProductServiceChange(item.id, 'warrantyDays', e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                        placeholder="Warranty period in days"
                                                        min="1"
                                                    />
                                                )}
                                            </div>

                                            {/* What's Included */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Gift className="inline mr-1" size={16} />
                                                    What's Included
                                                </label>
                                                <textarea
                                                    value={item.includes}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'includes', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="List what's included (one per line or comma-separated)"
                                                />
                                            </div>

                                            {/* Requirements */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <AlertCircle className="inline mr-1" size={16} />
                                                    Requirements from Customer
                                                </label>
                                                <textarea
                                                    value={item.requirements}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'requirements', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="Any requirements from customer (materials, access, preparation, etc.)"
                                                />
                                            </div>

                                            {/* Special Instructions */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Special Instructions
                                                </label>
                                                <textarea
                                                    value={item.specialInstructions}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'specialInstructions', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="Any special instructions or notes"
                                                />
                                            </div>

                                            {/* Tags */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Tag className="inline mr-1" size={16} />
                                                    Tags (for search & filtering)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.tags}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'tags', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="Enter tags separated by commas (e.g., fast, reliable, premium)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Step 4: Contact & Review */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <CheckCircle className="text-orange-500" size={24} />
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                        Contact Information & Review
                                    </h2>
                                </div>

                                {/* Serviceable Areas */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Serviceable Areas *
                                    </label>
                                    {formData.serviceableAreas.map((area, index) => (
                                        <div key={index} className="flex items-center space-x-2 mb-2">
                                            <input
                                                type="text"
                                                value={area}
                                                onChange={(e) => handleServiceableAreaChange(index, e.target.value)}
                                                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                placeholder="Enter area/city you serve"
                                                required
                                            />
                                            {formData.serviceableAreas.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeServiceableArea(index)}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addServiceableArea}
                                        className="mt-2 text-orange-500 hover:text-orange-700 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <Plus size={16} />
                                        <span>Add Another Area</span>
                                    </button>
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Contact Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.contactPhone}
                                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                            placeholder="09XX XXX XXXX"
                                            required
                                        />
                                        {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Contact Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.contactEmail}
                                            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                            placeholder="business@example.com"
                                            required
                                        />
                                        {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                                    </div>
                                </div>

                                {/* Service Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Additional Store Description
                                    </label>
                                    <textarea
                                        value={formData.serviceDescription}
                                        onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="Additional information about your store, policies, and what makes your business unique"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-600">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                    currentStep === 1
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                            >
                                Previous
                            </button>

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2"
                                >
                                    <span>Next</span>
                                    <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2 ${
                                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <Save size={16} />
                                    <span>{isSubmitting ? 'Creating...' : 'Create Store'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </VendorLayout>
    );
}