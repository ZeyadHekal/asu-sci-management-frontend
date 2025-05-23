import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { LuArrowLeft } from "react-icons/lu";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

// Define form schema with Zod
const reportSchema = z.object({
    deviceId: z.object({
        value: z.number(),
        label: z.string()
    }),
    problemType: z.object({
        value: z.string(),
        label: z.string()
    }),
    description: z.string().min(10, "Description must be at least 10 characters"),
    urgency: z.object({
        value: z.string(),
        label: z.string()
    }),
    attachments: z.any().optional()
});

type ReportFormData = z.infer<typeof reportSchema>;

// Mock devices data
const deviceOptions = [
    { value: 1, label: "Dell PC 01 (Lab B2-215)" },
    { value: 2, label: "Dell PC 02 (Lab B2-215)" },
    { value: 3, label: "Dell PC 03 (Lab A1-110)" }
];

const problemTypeOptions = [
    { value: "hardware", label: "Hardware Issue" },
    { value: "software", label: "Software Issue" },
    { value: "network", label: "Network Issue" },
    { value: "peripheral", label: "Peripheral Issue" },
    { value: "other", label: "Other" }
];

const urgencyOptions = [
    { value: "low", label: "Low - Not urgent" },
    { value: "medium", label: "Medium - Affecting work" },
    { value: "high", label: "High - Critical" }
];

const ReportProblemPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preSelectedDevice, setPreSelectedDevice] = useState<{ value: number, label: string } | null>(null);

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ReportFormData>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            description: "",
        }
    });

    // Check for device ID in URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const deviceIdParam = urlParams.get('deviceId');

        if (deviceIdParam) {
            const deviceId = parseInt(deviceIdParam);
            const device = deviceOptions.find(d => d.value === deviceId);
            if (device) {
                setPreSelectedDevice(device);
                setValue("deviceId", device);
            }
        }
    }, [setValue]);

    const onSubmit = (data: ReportFormData) => {
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            console.log("Submitted report:", data);
            toast.success("Report submitted successfully!");
            setIsSubmitting(false);

            // Redirect to device history with the reports tab selected
            navigate(`/devices/${data.deviceId.value}/history?tab=reports`);
        }, 1500);
    };

    return (
        <div className="panel mt-6">
            <div className="mb-6 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/devices" className="text-secondary hover:text-secondary-dark">
                        <LuArrowLeft size={18} />
                    </Link>
                    <h1 className="text-2xl font-semibold text-secondary">Report a Problem</h1>
                </div>

                <div className="max-w-3xl">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-sm text-blue-700">
                            Use this form to report any issues with lab devices. Your report will be reviewed by the lab administrators
                            and addressed as soon as possible.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Device Selection */}
                        <div className="form-group">
                            <label htmlFor="deviceId" className="form-label">
                                Device <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="deviceId"
                                control={control}
                                defaultValue={preSelectedDevice || undefined}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={deviceOptions}
                                        placeholder="Select the device with issue"
                                        className="basic-single"
                                        classNamePrefix="react-select"
                                        isSearchable
                                    />
                                )}
                            />
                            {errors.deviceId && (
                                <span className="text-danger text-sm">{errors.deviceId.message}</span>
                            )}
                        </div>

                        {/* Problem Type */}
                        <div className="form-group">
                            <label htmlFor="problemType" className="form-label">
                                Problem Type <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="problemType"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={problemTypeOptions}
                                        placeholder="Select the type of problem"
                                        className="basic-single"
                                        classNamePrefix="react-select"
                                    />
                                )}
                            />
                            {errors.problemType && (
                                <span className="text-danger text-sm">{errors.problemType.message}</span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label htmlFor="description" className="form-label">
                                Problem Description <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <textarea
                                        {...field}
                                        className="form-textarea"
                                        rows={5}
                                        placeholder="Please describe the issue in detail. Include what you were doing when the problem occurred."
                                    />
                                )}
                            />
                            {errors.description && (
                                <span className="text-danger text-sm">{errors.description.message}</span>
                            )}
                        </div>

                        {/* Urgency */}
                        <div className="form-group">
                            <label htmlFor="urgency" className="form-label">
                                Urgency <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="urgency"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={urgencyOptions}
                                        placeholder="Select urgency level"
                                        className="basic-single"
                                        classNamePrefix="react-select"
                                    />
                                )}
                            />
                            {errors.urgency && (
                                <span className="text-danger text-sm">{errors.urgency.message}</span>
                            )}
                        </div>

                        {/* Attachments */}
                        <div className="form-group">
                            <label htmlFor="attachments" className="form-label">
                                Attachments (Optional)
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">Upload screenshots or relevant files (max 3 files)</p>
                                    </div>
                                    <input
                                        id="attachments"
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                // Handle file uploads
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <Link
                                to="/devices"
                                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark disabled:opacity-70"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Report"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportProblemPage; 