import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
    fetchBatches,
    fetchBatchById,
    createBatch,
    updateBatch,
    deleteBatch,
    setFilters,
    setPage,
    removeBatchOptimistic,
} from './batchSlice';
import type { FetchBatchesParams, CreateBatchPayload, UpdateBatchPayload } from './batchApi';

export const useBatchList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: RootState) => state.batch);

    const loadBatches = (params: FetchBatchesParams) => {
        dispatch(fetchBatches(params));
    };

    return {
        batches: state.items,
        total: state.total,
        loading: state.listLoading,
        error: state.listError,
        loadBatches,
    };
};

export const useBatchDetail = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: RootState) => state.batch);

    const loadBatch = (id: string) => {
        dispatch(fetchBatchById(id));
    };

    return {
        batch: state.selectedBatch,
        loading: state.detailLoading,
        error: state.detailError,
        loadBatch,
    };
};

export const useBatchMutations = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: RootState) => state.batch);

    const handleCreateBatch = (payload: CreateBatchPayload) => {
        return dispatch(createBatch(payload));
    };

    const handleUpdateBatch = (payload: UpdateBatchPayload) => {
        return dispatch(updateBatch(payload));
    };

    const handleDeleteBatch = (id: string) => {
        dispatch(removeBatchOptimistic(id));
        return dispatch(deleteBatch(id));
    };

    return {
        creating: state.creating,
        updating: state.updating,
        deleting: state.deleting,
        createError: state.createError,
        updateError: state.updateError,
        deleteError: state.deleteError,
        createBatch: handleCreateBatch,
        updateBatch: handleUpdateBatch,
        deleteBatch: handleDeleteBatch,
    };
};

export const useBatch = () => {
    const list = useBatchList();
    const detail = useBatchDetail();
    const mutations = useBatchMutations();

    return {
        ...list,
        ...detail,
        ...mutations,
    };
};
