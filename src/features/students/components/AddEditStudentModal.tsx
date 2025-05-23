import { useState, useCallback, useEffect } from "react";
import Modal from "../../../ui/modal/Modal";
import { StudentDto } from "../../../generated/types/StudentDto";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiX } from "react-icons/fi";

// Form schema for student
const studentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    seatNo: z.coerce.number().min(1, "Seat number is required"),
    level: z.coerce.number().min(1, "Level is required").max(4, "Level must be between 1 and 4"),
    program: z.string().min(1, "Program is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    photo: z.instanceof(File).optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface AddEditStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: StudentDto | null;
    isEditing: boolean;
    onSubmitSuccess?: (studentData: StudentFormValues) => void;
}

const AddEditStudentModal = ({ isOpen, onClose, student, isEditing, onSubmitSuccess }: AddEditStudentModalProps) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Initialize the form with the student data or empty values
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
        defaultValues: student
            ? {
                name: student.name,
                seatNo: student.seatNo || 0,
                level: student.level || 1,
                program: student.program || "",
                username: student.username || "",
                password: "", // Password is always empty for editing
            }
            : {
                name: "",
                seatNo: 0,
                level: 1,
                program: "",
                username: "",
                password: "",
            },
    });

    // Set image preview when student has a photo and we're editing
    useEffect(() => {
        if (isEditing && student && student.photo) {
            setImagePreview(student.photo);
        } else {
            setImagePreview(null);
        }
    }, [student, isEditing]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setValue("photo", file);
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [setValue]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 1,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: StudentFormValues) => {
        setIsSubmitting(true);
        try {
            console.log("Form data:", data);
            // Here you would either create a new student or update an existing one
            // using the appropriate API calls

            // Call onSubmitSuccess if it's defined, passing the student data
            if (onSubmitSuccess) {
                onSubmitSuccess(data);
            }
            
            // Close the modal after successful submission
            reset();
            setImagePreview(null);
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "Edit Student" : "Add New Student"}
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                        placeholder="Enter student name"
                        {...register("name")}
                    />
                    {errors.name && (
                        <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="seatNo" className="block text-sm font-medium text-gray-700">
                        Seat Number
                    </label>
                    <input
                        id="seatNo"
                        type="number"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                        placeholder="Enter seat number"
                        {...register("seatNo")}
                    />
                    {errors.seatNo && (
                        <p className="mt-1 text-xs text-red-600">{errors.seatNo.message}</p>
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
                        placeholder="Enter username"
                        {...register("username")}
                    />
                    {errors.username && (
                        <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
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
                        placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                        Level
                    </label>
                    <select
                        id="level"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                        {...register("level")}
                    >
                        <option value={1}>Level 1</option>
                        <option value={2}>Level 2</option>
                        <option value={3}>Level 3</option>
                        <option value={4}>Level 4</option>
                    </select>
                    {errors.level && (
                        <p className="mt-1 text-xs text-red-600">{errors.level.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                        Program
                    </label>
                    <select
                        id="program"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                        {...register("program")}
                    >
                        <option value="">Select a program</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Statistics">Statistics</option>
                        <option value="Physics">Physics</option>
                    </select>
                    {errors.program && (
                        <p className="mt-1 text-xs text-red-600">{errors.program.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photo
                    </label>
                    <div
                        {...getRootProps()}
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragActive ? "border-secondary bg-secondary/5" : "border-gray-300"
                            }`}
                    >
                        <div className="space-y-1 text-center">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mx-auto h-32 w-32 object-cover rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImagePreview(null);
                                            setValue("photo", undefined);
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
                    {errors.photo && (
                        <p className="mt-1 text-xs text-red-600">{errors.photo.message}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                    >
                        {isSubmitting ? "Saving..." : isEditing ? "Update" : "Add"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEditStudentModal; 