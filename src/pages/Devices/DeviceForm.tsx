import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { DeviceDto } from '@/generated/types/DeviceDto';
import { useDeviceControllerCreate } from '@/generated/hooks/devicesHooks/useDeviceControllerCreate';
import { useDeviceControllerUpdate } from '@/generated/hooks/devicesHooks/useDeviceControllerUpdate';
import { useDeviceControllerGetById } from '@/generated/hooks/devicesHooks/useDeviceControllerGetById';
import Button from '@/components/Button';
import toast from 'react-hot-toast';

type DeviceFormData = Omit<DeviceDto, 'id'>;

const DeviceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<DeviceFormData>();

    const { data: deviceData } = useDeviceControllerGetById(
        { params: { id: id! } },
        { enabled: isEditMode }
    );

    const { mutate: createDevice } = useDeviceControllerCreate({
        onSuccess: () => {
            toast.success('Device created successfully');
            navigate('/devices');
        },
        onError: (error) => {
            toast.error('Failed to create device: ' + error.message);
        },
    });

    const { mutate: updateDevice } = useDeviceControllerUpdate({
        onSuccess: () => {
            toast.success('Device updated successfully');
            navigate('/devices');
        },
        onError: (error) => {
            toast.error('Failed to update device: ' + error.message);
        },
    });

    useEffect(() => {
        if (deviceData) {
            reset({
                IPAddress: deviceData.IPAddress,
                labId: deviceData.labId,
                assisstantId: deviceData.assisstantId,
            });
        }
    }, [deviceData, reset]);

    const onSubmit = (data: DeviceFormData) => {
        if (isEditMode) {
            updateDevice({
                params: { id: id! },
                data,
            });
        } else {
            createDevice({ data });
        }
    };

    return (
        <div className="panel">
            <div className="mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">
                    {isEditMode ? 'Edit Device' : 'Add New Device'}
                </h5>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="IPAddress" className="form-label">
                        IP Address
                    </label>
                    <input
                        id="IPAddress"
                        type="text"
                        className="form-input"
                        {...register('IPAddress', { required: 'IP Address is required' })}
                    />
                    {errors.IPAddress && (
                        <span className="text-danger text-sm">{errors.IPAddress.message}</span>
                    )}
                </div>

                <div>
                    <label htmlFor="labId" className="form-label">
                        Lab ID
                    </label>
                    <input
                        id="labId"
                        type="text"
                        className="form-input"
                        {...register('labId', { required: 'Lab ID is required' })}
                    />
                    {errors.labId && (
                        <span className="text-danger text-sm">{errors.labId.message}</span>
                    )}
                </div>

                <div>
                    <label htmlFor="assisstantId" className="form-label">
                        Assistant ID
                    </label>
                    <input
                        id="assisstantId"
                        type="text"
                        className="form-input"
                        {...register('assisstantId', { required: 'Assistant ID is required' })}
                    />
                    {errors.assisstantId && (
                        <span className="text-danger text-sm">{errors.assisstantId.message}</span>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline-danger"
                        onClick={() => navigate('/devices')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        {isEditMode ? 'Update' : 'Create'} Device
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DeviceForm; 