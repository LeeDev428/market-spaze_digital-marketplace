import { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import VendorLayout from '../../../layouts/app/VendorLayout';
import { 
    Building2, 
    FileText, 
    ShoppingBag, 
    Package, 
    MapPin, 
    Phone, 
    Mail, 
    Upload, 
    Plus, 
    Trash2, 
    Save,
    ArrowRight,
    CheckCircle,
    ArrowLeft,
    Clock,
    Percent,
    Gift,
    AlertCircle,
    Shield,
    Truck,
    Home
} from 'lucide-react';

interface ProductService {
    id: string;
    name: string;
    description: string;
    priceMin: string;
    priceMax: string;
    category: string;
    durationMinutes: string;
    discountPercentage: string;
    includes: string;
    requirements: string;
    warrantyInfo: string;
    pickupAvailable: boolean;
    deliveryAvailable: boolean;
}

interface VendorStore {
    id: number;
    business_name: string;
    description: string;
    business_type: 'products' | 'services';
    address: string;
    serviceable_areas: string[];
    contact_phone: string;
    contact_email: string;
    service_description: string;
    logo_path: string | null;
}

interface Props {
    vendorStore: VendorStore;
    productsServices?: any[];
}

export default function EditStore({ vendorStore, productsServices = [] }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    
    // Initialize form data from props
    const [formData, setFormData] = useState({
        businessName: vendorStore.business_name,
        description: vendorStore.description,
        businessType: vendorStore.business_type,
        address: vendorStore.address,
        serviceableAreas: vendorStore.serviceable_areas.length > 0 ? vendorStore.serviceable_areas : [''],
        contactPhone: vendorStore.contact_phone,
        contactEmail: vendorStore.contact_email,
        serviceDescription: vendorStore.service_description || '',
        logo: null as File | null,
    });
    
    // Initialize products/services from props with enhanced fields
    const [productServices, setProductServices] = useState<ProductService[]>(
        productsServices.length > 0 
            ? productsServices.map((item, index) => ({
                id: index.toString(),
                name: item.name || '',
                description: item.description || '',
                priceMin: item.price_min?.toString() || '',
                priceMax: item.price_max?.toString() || '',
                category: item.category || '',
                durationMinutes: item.duration_minutes?.toString() || '',
                discountPercentage: item.discount_percentage?.toString() || '',
                includes: Array.isArray(item.includes) ? item.includes.join('\n') : (item.includes || ''),
                requirements: Array.isArray(item.requirements) ? item.requirements.join('\n') : (item.requirements || ''),
                warrantyInfo: item.warranty_info || '',
                pickupAvailable: item.pickup_available || false,
                deliveryAvailable: item.delivery_available || false,
            }))
            : [{
                id: '1', 
                name: '', 
                description: '', 
                priceMin: '', 
                priceMax: '',
                category: '',
                durationMinutes: '',
                discountPercentage: '',
                includes: '',
                requirements: '',
                warrantyInfo: '',
                pickupAvailable: false,
                deliveryAvailable: false
            }]
    );

    const [logoPreview, setLogoPreview] = useState<string | null>(
        vendorStore.logo_path ? `/storage/${vendorStore.logo_path}` : null
    );

    // Initialize Inertia form
    const { data, setData, put, processing, errors } = useForm({
        businessName: formData.businessName,
        description: formData.description,
        businessType: formData.businessType,
        address: formData.address,
        serviceableAreas: formData.serviceableAreas,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        serviceDescription: formData.serviceDescription,
        logo: formData.logo,
        productServices: [] as any[],
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setData(field as any, value);
    };

    const handleServiceableAreaChange = (index: number, value: string) => {
        const newAreas = [...formData.serviceableAreas];
        newAreas[index] = value;
        setFormData(prev => ({
            ...prev,
            serviceableAreas: newAreas
        }));
        setData('serviceableAreas', newAreas);
    };

    const addServiceableArea = () => {
        const newAreas = [...formData.serviceableAreas, ''];
        setFormData(prev => ({
            ...prev,
            serviceableAreas: newAreas
        }));
        setData('serviceableAreas', newAreas);
    };

    const removeServiceableArea = (index: number) => {
        const newAreas = formData.serviceableAreas.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            serviceableAreas: newAreas
        }));
        setData('serviceableAreas', newAreas);
    };

    const handleProductServiceChange = (id: string, field: string, value: string | boolean) => {
        const updatedServices = productServices.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        setProductServices(updatedServices);
        setData('productServices', updatedServices);
    };

    const handleIncludesRequirementsChange = (id: string, field: 'includes' | 'requirements', value: string) => {
        const updatedServices = productServices.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        setProductServices(updatedServices);
        setData('productServices', updatedServices);
    };

    const addProductService = () => {
        const newId = Date.now().toString();
        const newServices = [
            ...productServices,
            { 
                id: newId, 
                name: '', 
                description: '', 
                priceMin: '', 
                priceMax: '',
                category: '',
                durationMinutes: '',
                discountPercentage: '',
                includes: '',
                requirements: '',
                warrantyInfo: '',
                pickupAvailable: false,
                deliveryAvailable: false
            }
        ];
        setProductServices(newServices);
        setData('productServices', newServices);
    };

    const removeProductService = (id: string) => {
        const newServices = productServices.filter(item => item.id !== id);
        setProductServices(newServices);
        setData('productServices', newServices);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, logo: file }));
            setData('logo', file);
            
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Update all form data before submission
        setData({
            businessName: formData.businessName,
            description: formData.description,
            businessType: formData.businessType,
            address: formData.address,
            serviceableAreas: formData.serviceableAreas.filter(area => area.trim() !== ''),
            contactPhone: formData.contactPhone,
            contactEmail: formData.contactEmail,
            serviceDescription: formData.serviceDescription,
            logo: formData.logo,
            productServices: productServices.filter(item => item.name.trim() !== '')
        });

        // Update existing store
        put(route('vendor.store.update', vendorStore.id), {
            onSuccess: () => {
                console.log('Store updated successfully');
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
            }
        });
    };

    const stepTitles = [
        'Basic Information',
        'Products/Services',
        'Service Details',
        'Contact & Final Details'
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
        'Other'
    ];

    return (
        <VendorLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <Link
                            href={route('vendor.store.index')}
                            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Edit Store
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Update your business profile and services
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
                                <li key={key}>{message}</li>
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
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Building2 className="text-orange-500" size={24} />
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                        Basic Business Information
                                    </h2>
                                </div>

                                {/* Business Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Business Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.businessName}
                                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="Enter your business name"
                                        required
                                    />
                                    {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Business Description *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="Describe your business and what you offer"
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
                            </div>
                        )}

                        {/* Step 2: Products/Services Basic Info */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    {formData.businessType === 'products' ? (
                                        <Package className="text-orange-500" size={24} />
                                    ) : (
                                        <ShoppingBag className="text-orange-500" size={24} />
                                    )}
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                        {formData.businessType === 'products' ? 'Products' : 'Services'} Information
                                    </h2>
                                </div>

                                {productServices.map((item, index) => (
                                    <div key={item.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                                                {formData.businessType === 'products' ? 'Product' : 'Service'} #{index + 1}
                                            </h3>
                                            {productServices.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeProductService(item.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

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
                                                    placeholder={`Describe your ${formData.businessType === 'products' ? 'product' : 'service'}`}
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

                        {/* Step 3: Service Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <FileText className="text-orange-500" size={24} />
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                        Additional Service Details
                                    </h2>
                                </div>

                                {productServices.map((item, index) => (
                                    <div key={item.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                                                {item.name || `${formData.businessType === 'products' ? 'Product' : 'Service'} #${index + 1}`}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Percent className="inline mr-1" size={16} />
                                                    Current Discount (%)
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

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Shield className="inline mr-1" size={16} />
                                                    Warranty Information
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.warrantyInfo}
                                                    onChange={(e) => handleProductServiceChange(item.id, 'warrantyInfo', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="e.g., 1 year warranty, 30-day guarantee"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <Gift className="inline mr-1" size={16} />
                                                    What's Included
                                                </label>
                                                <textarea
                                                    value={item.includes}
                                                    onChange={(e) => handleIncludesRequirementsChange(item.id, 'includes', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="List what's included in this service/product (one per line or comma-separated)"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    <AlertCircle className="inline mr-1" size={16} />
                                                    Requirements
                                                </label>
                                                <textarea
                                                    value={item.requirements}
                                                    onChange={(e) => handleIncludesRequirementsChange(item.id, 'requirements', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                                    placeholder="Any requirements from the customer (materials, access, preparation, etc.)"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                                    Delivery Options
                                                </label>
                                                <div className="space-y-3">
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
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Step 4: Contact & Final Details */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <MapPin className="text-orange-500" size={24} />
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                        Contact Information & Final Details
                                    </h2>
                                </div>

                                {/* Address */}
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
                                        Detailed Service Description
                                    </label>
                                    <textarea
                                        value={formData.serviceDescription}
                                        onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-slate-700 dark:text-white"
                                        placeholder="Provide a detailed description of your services, policies, and what makes your business unique"
                                    />
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Business Logo
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <label className="block w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center cursor-pointer hover:border-orange-500 transition-colors">
                                                <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    Click to upload new logo (optional)
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        {logoPreview && (
                                            <div className="w-24 h-24 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
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
                                    disabled={processing}
                                    className={`px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2 ${
                                        processing ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <Save size={16} />
                                    <span>{processing ? 'Updating...' : 'Update Store'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </VendorLayout>
    );
}