import { useState } from 'react';
import { useDeviceControllerGetPaginated } from '@/generated/hooks/devicesHooks/useDeviceControllerGetPaginated';
import { useDeviceControllerDelete } from '@/generated/hooks/devicesHooks/useDeviceControllerDelete';
import { DeviceDto } from '@/generated/types/DeviceDto';
import Button from '@/components/Button';
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

const Devices = () => {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const navigate = useNavigate();

    const { data: devicesData, isLoading } = useDeviceControllerGetPaginated({
        params: {
            page,
            limit: pageSize,
        },
    });

    const { mutate: deleteDevice } = useDeviceControllerDelete({
        onSuccess: () => {
            toast.success('Device deleted successfully');
        },
        onError: (error) => {
            toast.error('Failed to delete device: ' + error.message);
        },
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this device?')) {
            deleteDevice({ params: { id } });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="flex justify-between items-center mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Devices</h5>
                <Button variant="primary" onClick={() => navigate('/devices/new')}>
                    <IconPlus className="w-5 h-5" />
                    Add Device
                </Button>
            </div>

            <div className="table-responsive">
                <table className="table-striped">
                    <thead>
                        <tr>
                            <th>IP Address</th>
                            <th>Lab ID</th>
                            <th>Assistant ID</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devicesData?.items?.map((device: DeviceDto) => (
                            <tr key={device.id}>
                                <td>{device.IPAddress}</td>
                                <td>{device.labId}</td>
                                <td>{device.assisstantId}</td>
                                <td className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => navigate('/devices/edit/' + device.id)}
                                        >
                                            <IconEdit className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDelete(device.id)}
                                        >
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {devicesData?.meta && (
                <div className="flex items-center justify-between mt-5">
                    <div className="flex items-center gap-2">
                        <span>Showing</span>
                        <select
                            className="form-select"
                            value={pageSize}
                            onChange={(e) => setPage(parseInt(e.target.value))}
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                        <span>entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline-primary"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline-primary"
                            disabled={page === devicesData.meta.totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Devices; 