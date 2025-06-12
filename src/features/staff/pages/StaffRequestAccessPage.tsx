import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { useStaffRequestControllerCreate } from "../../../generated/hooks/staff-requestsHooks/useStaffRequestControllerCreate";
import { createStaffRequestDtoSchema } from "../../../generated/zod/createStaffRequestDtoSchema";
import { toast } from "react-hot-toast";

// Strong password validation
const strongPasswordSchema = z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const staffRequestSchema = createStaffRequestDtoSchema.extend({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type StaffRequestFormValues = z.infer<typeof staffRequestSchema>;

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const requirements = [
        { text: "At least 8 characters", met: password.length >= 8 },
        { text: "One uppercase letter", met: /[A-Z]/.test(password) },
        { text: "One lowercase letter", met: /[a-z]/.test(password) },
        { text: "One number", met: /[0-9]/.test(password) },
        { text: "One special character", met: /[^a-zA-Z0-9]/.test(password) },
    ];

    const metCount = requirements.filter(req => req.met).length;
    const strength = metCount === 0 ? 0 : (metCount / requirements.length) * 100;

    const getStrengthColor = () => {
        if (strength < 40) return "bg-red-500";
        if (strength < 80) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthText = () => {
        if (strength < 40) return "Weak";
        if (strength < 80) return "Medium";
        return "Strong";
    };

    return (
        <div className="mt-2">
            <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${strength}%` }}
                    ></div>
                </div>
                <span className={`text-xs font-medium ${
                    strength < 40 ? 'text-red-600' : 
                    strength < 80 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                    {getStrengthText()}
                </span>
            </div>
            <ul className="text-xs space-y-1">
                {requirements.map((req, index) => (
                    <li key={index} className={`flex items-center gap-2 ${
                        req.met ? 'text-green-600' : 'text-gray-500'
                    }`}>
                        <span className={`w-3 h-3 rounded-full text-white text-xs flex items-center justify-center ${
                            req.met ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                            {req.met ? '✓' : ''}
                        </span>
                        {req.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const StaffRequestAccessPage = () => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const createMutation = useStaffRequestControllerCreate();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<StaffRequestFormValues>({
        resolver: zodResolver(staffRequestSchema),
    });

    const watchedPassword = watch("password") || "";

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setValue("idPhoto", file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    }, [setValue]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 1,
        multiple: false
    });

    const removePhoto = () => {
        setValue("idPhoto", undefined);
        setPreviewUrl(null);
    };

    const onSubmit = async (data: StaffRequestFormValues) => {
        try {
            // Prepare the request data according to CreateStaffRequestDto
            // Backend now expects 'username' field instead of 'email'
            const requestData = {
                name: data.name,
                username: data.username,
                title: data.title,
                department: data.department,
                password: data.password,
                confirmPassword: data.confirmPassword,
                idPhoto: data.idPhoto,
            };

            await createMutation.mutateAsync({
                data: requestData,
            });

            toast.success("Staff request submitted successfully");
            navigate("/login");
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to submit staff request");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Request Staff Access
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Fill out this form to request access to the staff portal
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                {...register("username")}
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Job Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                {...register("title")}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                Department
                            </label>
                            <input
                                id="department"
                                type="text"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                {...register("department")}
                            />
                            {errors.department && (
                                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                            {watchedPassword && (
                                <PasswordStrengthIndicator password={watchedPassword} />
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                    {...register("confirmPassword")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                ID Photo
                            </label>
                            <div
                                {...getRootProps()}
                                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragActive
                                    ? "border-secondary bg-secondary/5"
                                    : "border-gray-300 hover:border-secondary/50"
                                    }`}
                            >
                                <div className="space-y-1 text-center">
                                    {previewUrl ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrl}
                                                alt="ID Photo Preview"
                                                className="mx-auto h-32 w-32 object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removePhoto();
                                                }}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer rounded-md font-medium text-secondary hover:text-secondary-dark"
                                                >
                                                    <span>Upload a file</span>
                                                    <input {...getInputProps()} className="sr-only" />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, JPEG up to 10MB
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                            {errors.idPhoto && (
                                <p className="mt-1 text-sm text-red-600">{errors.idPhoto.message}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                            >
                                {createMutation.isPending ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffRequestAccessPage; 