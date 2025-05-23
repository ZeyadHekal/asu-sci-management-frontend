import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { FiUpload, FiX } from "react-icons/fi";
import { useDropzone } from "react-dropzone";
import { useStaffRequestControllerCreate } from "../../../generated/hooks/staff-requestsHooks/useStaffRequestControllerCreate";
import { createStaffRequestDtoSchema } from "../../../generated/zod/createStaffRequestDtoSchema";
import { toast } from "react-hot-toast";

const staffRequestSchema = createStaffRequestDtoSchema.extend({
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type StaffRequestFormValues = z.infer<typeof staffRequestSchema>;

const StaffRequestAccessPage = () => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const navigate = useNavigate();
    const createMutation = useStaffRequestControllerCreate();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<StaffRequestFormValues>({
        resolver: zodResolver(staffRequestSchema),
    });

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
            const requestData = {
                name: data.name,
                email: data.email,
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
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
                            <input
                                id="password"
                                type="password"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                                {...register("confirmPassword")}
                            />
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