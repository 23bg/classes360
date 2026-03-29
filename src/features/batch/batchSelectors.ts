import { RootState } from '@/store';

export const selectBatchState = (state: RootState) => state.batch;
export const selectBatchList = (state: RootState) => state.batch.items;
export const selectBatchTotal = (state: RootState) => state.batch.total;
export const selectSelectedBatch = (state: RootState) => state.batch.selectedBatch;
export const selectBatchLoading = (state: RootState) => ({
    list: state.batch.listLoading,
    detail: state.batch.detailLoading,
    creating: state.batch.creating,
    updating: state.batch.updating,
    deleting: state.batch.deleting,
});
export const selectBatchErrors = (state: RootState) => ({
    list: state.batch.listError,
    detail: state.batch.detailError,
    create: state.batch.createError,
    update: state.batch.updateError,
    delete: state.batch.deleteError,
});
