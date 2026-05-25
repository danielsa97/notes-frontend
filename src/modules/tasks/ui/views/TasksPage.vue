<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center gap-3 mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ t("tasks.title") }}</h1>
          <p class="text-gray-600">{{ t("tasks.subtitle", { workspace: workspaceName }) }}</p>
        </div>
        <div class="flex gap-2">
          <Button variant="ghost" @click="handleExportDailyCsv">
            {{ t("tasks.exportDailyCsv") }}
          </Button>
          <Button @click="openCreateModal">
            <span class="sm:hidden">+</span>
            <span class="hidden sm:inline">{{ t("tasks.add") }}</span>
          </Button>
        </div>
      </div>

      <Alert
        v-if="taskStore.error"
        type="error"
        :title="t('tasks.errorTitle')"
        :message="taskStore.error"
      />

      <div
        v-if="taskStore.recurringIssues.length"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3"
      >
        <p class="font-semibold text-red-800 mb-1">{{ t("tasks.recurringAlertTitle") }}</p>
        <p class="text-sm text-red-700">
          {{ t("tasks.recurringAlertDescription") }}
        </p>
        <div class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="issue in taskStore.recurringIssues.slice(0, 6)"
            :key="issue.roomId"
            class="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800"
          >
            {{ displayRoom(issue.roomId) }}: {{ issue.occurrences }}x
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <Card>
          <p class="text-xs text-gray-500 mb-1">{{ t("tasks.counts.PENDENTE") }}</p>
          <p class="text-2xl font-bold text-yellow-600">{{ overviewCount("PENDENTE") }}</p>
        </Card>
        <Card>
          <p class="text-xs text-gray-500 mb-1">{{ t("tasks.counts.EM_ANDAMENTO") }}</p>
          <p class="text-2xl font-bold text-blue-600">{{ overviewCount("EM_ANDAMENTO") }}</p>
        </Card>
        <Card>
          <p class="text-xs text-gray-500 mb-1">{{ t("tasks.counts.CONCLUIDA") }}</p>
          <p class="text-2xl font-bold text-green-600">{{ overviewCount("CONCLUIDA") }}</p>
        </Card>
        <Card>
          <p class="text-xs text-gray-500 mb-1">{{ t("tasks.pendingItems") }}</p>
          <p class="text-2xl font-bold text-red-600">{{ taskStore.dailyOverview?.totalItemsPending ?? 0 }}</p>
        </Card>
      </div>

      <div class="flex flex-wrap gap-3 mb-6">
        <Input v-model="selectedDate" type="date" :label="t('tasks.selectedDate')" />

        <div class="min-w-[220px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t("tasks.filterByStatus") }}</label>
          <select
            v-model="filterStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{{ t("tasks.filterAll") }}</option>
            <option value="PENDENTE">{{ t("tasks.statusValues.PENDENTE") }}</option>
            <option value="EM_ANDAMENTO">{{ t("tasks.statusValues.EM_ANDAMENTO") }}</option>
            <option value="CONCLUIDA">{{ t("tasks.statusValues.CONCLUIDA") }}</option>
            <option value="CANCELADA">{{ t("tasks.statusValues.CANCELADA") }}</option>
          </select>
        </div>
      </div>

      <div v-if="taskStore.loading" class="space-y-4">
        <Card v-for="i in 4" :key="i">
          <Shimmer height="1rem" width="60%" class="mb-2" />
          <Shimmer height="0.75rem" width="80%" />
        </Card>
      </div>

      <div
        v-else-if="taskStore.runs.length === 0"
        class="bg-white rounded-lg shadow px-4 py-10 text-center text-gray-500"
      >
        {{ t("tasks.empty") }}
      </div>

      <div v-else class="space-y-4">
        <Card
          v-for="run in taskStore.runs"
          :key="run.id"
          class="hover:shadow-md transition cursor-pointer"
          @click="openRunModal(run.id)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="text-base font-semibold text-gray-900 truncate">{{ run.task.title }}</h3>
                <Badge :variant="statusVariant(run.status)">
                  {{ t(`tasks.statusValues.${run.status}`) }}
                </Badge>
                <Badge variant="secondary">{{ t(`tasks.typeValues.${run.task.type}`) }}</Badge>
              </div>
              <p v-if="run.task.description" class="text-sm text-gray-600 mb-2 line-clamp-2">
                {{ run.task.description }}
              </p>
              <div class="text-xs text-gray-500 flex flex-wrap gap-3">
                <span>{{ t("tasks.itemsSummary", { done: completedItems(run), total: run.items.length }) }}</span>
                <span>{{ t("tasks.runDate") }}: {{ formatDate(run.run_date) }}</span>
                <span v-if="run.task.due_date">{{ t("tasks.dueDate") }}: {{ formatDate(run.task.due_date) }}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card class="mt-8">
        <div class="flex flex-wrap items-end gap-3 mb-4">
          <Input v-model="historyFrom" type="date" :label="t('tasks.historyFrom')" />
          <Input v-model="historyTo" type="date" :label="t('tasks.historyTo')" />
          <Button variant="ghost" @click="loadHistory">{{ t("tasks.loadHistory") }}</Button>
        </div>

        <div v-if="!taskStore.history || taskStore.history.byDay.length === 0" class="text-sm text-gray-500">
          {{ t("tasks.noHistory") }}
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="day in taskStore.history.byDay"
            :key="day.date"
            class="rounded-lg border border-gray-200 p-3"
          >
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="font-semibold text-gray-800">{{ formatDate(day.date) }}</span>
              <span class="text-gray-500">{{ day.total }} {{ t("tasks.historyRuns") }}</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div class="rounded bg-yellow-50 px-2 py-1 text-yellow-800">{{ t("tasks.counts.PENDENTE") }}: {{ day.pendente }}</div>
              <div class="rounded bg-blue-50 px-2 py-1 text-blue-800">{{ t("tasks.counts.EM_ANDAMENTO") }}: {{ day.emAndamento }}</div>
              <div class="rounded bg-green-50 px-2 py-1 text-green-800">{{ t("tasks.counts.CONCLUIDA") }}: {{ day.concluida }}</div>
              <div class="rounded bg-gray-100 px-2 py-1 text-gray-700">{{ t("tasks.counts.CANCELADA") }}: {{ day.cancelada }}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <Modal
      :isOpen="isCreateModalOpen"
      :title="t('tasks.modalAddTitle')"
      @close="closeCreateModal"
      @confirm="saveTask"
    >
      <FormGroup @submit="saveTask" class="space-y-4">
        <Input
          v-model="createForm.title"
          :label="t('tasks.form.title')"
          :placeholder="t('tasks.form.titlePlaceholder')"
          required
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t("tasks.form.description") }}</label>
          <textarea
            v-model="createForm.description"
            :placeholder="t('tasks.form.descriptionPlaceholder')"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t("tasks.form.type") }}</label>
          <select
            v-model="createForm.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ROTINEIRA">{{ t("tasks.typeValues.ROTINEIRA") }}</option>
            <option value="ESPORADICA">{{ t("tasks.typeValues.ESPORADICA") }}</option>
            <option value="MANUTENCAO">{{ t("tasks.typeValues.MANUTENCAO") }}</option>
          </select>
        </div>

        <Input v-if="createForm.type === 'MANUTENCAO'" v-model="createForm.dueDate" :label="t('tasks.form.dueDate')" type="date" />

        <div v-if="createForm.type === 'ROTINEIRA'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input v-model="createForm.startsOn" :label="t('tasks.form.startsOn')" type="date" />
          <Input v-model="createForm.endsOn" :label="t('tasks.form.endsOn')" type="date" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t("tasks.form.rooms") }}</label>
          <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
            <label
              v-for="room in enabledRooms"
              :key="room.id"
              class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
            >
              <input
                type="checkbox"
                :value="room.id"
                v-model="createForm.roomIds"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">{{ room.room_id }}</span>
            </label>
          </div>
          <label class="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="createForm.isCommonArea"
              class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span class="text-sm text-gray-700">{{ t("tasks.form.isCommonArea") }}</span>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t("tasks.imageUploadLabel") }}</label>
          <ImagePicker
            :key="imageInputKey"
            :maxFiles="5"
            :disabled="taskStore.loading"
            @files-selected="handleImageSelection"
          />
        </div>
      </FormGroup>

      <template #footer>
        <Button variant="ghost" :disabled="taskStore.loading" @click="closeCreateModal">
          {{ t("common.cancel") }}
        </Button>
        <Button :loading="taskStore.loading" :disabled="taskStore.loading" @click="saveTask">
          {{ t("common.confirm") }}
        </Button>
      </template>
    </Modal>

    <Modal
      :isOpen="isRunModalOpen"
      :title="t('tasks.modalExecutionTitle')"
      @close="closeRunModal"
    >
      <div v-if="taskStore.loadingDetail" class="space-y-3">
        <Shimmer height="1rem" width="60%" />
        <Shimmer height="1rem" width="80%" />
      </div>

      <div v-else-if="taskStore.activeRun" class="space-y-4">
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="text-lg font-semibold text-gray-900">{{ taskStore.activeRun.task.title }}</h3>
          <Badge :variant="statusVariant(taskStore.activeRun.status)">
            {{ t(`tasks.statusValues.${taskStore.activeRun.status}`) }}
          </Badge>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in taskStore.activeRun.items"
            :key="item.id"
            class="border border-gray-200 rounded-lg p-3"
          >
            <div class="flex items-center justify-between gap-2 mb-2">
              <p class="font-medium text-gray-800">{{ displayRoom(item.room.room_id) }}</p>
              <Badge :variant="statusVariant(item.status)">{{ t(`tasks.statusValues.${item.status}`) }}</Badge>
            </div>

            <p v-if="item.execution_note" class="text-sm text-gray-600 mb-2">{{ item.execution_note }}</p>

            <div v-if="item.execution_image_urls.length" class="grid grid-cols-4 gap-2 mb-2">
              <img
                v-for="url in item.execution_image_urls"
                :key="url"
                :src="url"
                class="h-14 w-full rounded object-cover border border-gray-200"
              />
            </div>

            <textarea
              v-model="itemNotes[item.room_id]"
              :placeholder="t('tasks.executionNotePlaceholder')"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
            />

            <input
              type="file"
              accept="image/*"
              multiple
              class="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700"
              @change="onItemImagesChange($event, item.room_id)"
            />

            <div class="flex gap-2 mt-2">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
                @click="markItem(item.room_id, 'EM_ANDAMENTO')"
              >
                {{ t("tasks.actions.markInProgress") }}
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700"
                @click="markItem(item.room_id, 'CONCLUIDA')"
              >
                {{ t("tasks.actions.markDone") }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button variant="ghost" @click="closeRunModal">{{ t("common.close") }}</Button>
      </template>
    </Modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { TaskRun, TaskStatus, TaskType } from "@/core/utils/types";
import { useWorkspaceStore } from "@/modules/hotels/ui/stores/workspaceStore";
import { useRoomStore } from "@/modules/rooms/ui/stores/roomStore";
import { useTaskStore } from "@/modules/tasks/ui/stores/taskStore";
import Alert from "@/shared/components/Alert.vue";
import Badge from "@/shared/components/Badge.vue";
import Button from "@/shared/components/Button.vue";
import Card from "@/shared/components/Card.vue";
import FormGroup from "@/shared/components/FormGroup.vue";
import ImagePicker from "@/shared/components/ImagePicker.vue";
import Input from "@/shared/components/Input.vue";
import Modal from "@/shared/components/Modal.vue";
import Shimmer from "@/shared/components/Shimmer.vue";
import AppLayout from "@/shared/layouts/AppLayout.vue";

const { t } = useI18n();
const workspaceStore = useWorkspaceStore();
const roomStore = useRoomStore();
const taskStore = useTaskStore();

const workspaceName = computed(() => workspaceStore.activeHotel?.name ?? "-");
const enabledRooms = computed(() => roomStore.rooms.filter((room) => room.status === "ENABLED"));

const selectedDate = ref(new Date().toISOString().slice(0, 10));
const filterStatus = ref<TaskStatus | "">("");
const historyTo = ref(new Date().toISOString().slice(0, 10));
const historyFrom = ref(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

async function loadData() {
  if (!workspaceStore.activeHotel?.id) return;

  await Promise.all([
    taskStore.fetchRuns(workspaceStore.activeHotel.id, {
      date: selectedDate.value,
      status: filterStatus.value || undefined,
    }),
    taskStore.fetchDailyOverview(workspaceStore.activeHotel.id, selectedDate.value),
  ]);
}

watch([selectedDate, filterStatus], loadData);

onMounted(async () => {
  if (!workspaceStore.activeHotel?.id) return;
  await Promise.all([
    roomStore.fetchRooms(workspaceStore.activeHotel.id),
    loadData(),
    taskStore.fetchRecurringIssues(workspaceStore.activeHotel.id, {
      periodDays: 7,
      minOccurrences: 3,
    }),
    loadHistory(),
  ]);
});

async function loadHistory() {
  if (!workspaceStore.activeHotel?.id || !historyFrom.value || !historyTo.value) return;
  await taskStore.fetchHistory(workspaceStore.activeHotel.id, {
    from: historyFrom.value,
    to: historyTo.value,
  });
}

async function handleExportDailyCsv() {
  if (!workspaceStore.activeHotel?.id) return;
  await taskStore.exportDailyCsv(workspaceStore.activeHotel.id, selectedDate.value);
}

function overviewCount(status: TaskStatus) {
  return taskStore.dailyOverview?.byStatus?.[status] ?? 0;
}

function completedItems(run: TaskRun) {
  return run.items.filter((item) => item.status === "CONCLUIDA").length;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function displayRoom(roomId: string) {
  return roomId === "AREA_COMUM" ? t("tasks.commonAreaLabel") : roomId;
}

function statusVariant(status: TaskStatus) {
  const map: Record<TaskStatus, "warning" | "info" | "success" | "secondary"> = {
    PENDENTE: "warning",
    EM_ANDAMENTO: "info",
    CONCLUIDA: "success",
    CANCELADA: "secondary",
  };
  return map[status] ?? "secondary";
}

const isCreateModalOpen = ref(false);
const selectedImages = ref<File[]>([]);
const imageInputKey = ref(0);

const createForm = ref({
  title: "",
  description: "",
  dueDate: "",
  startsOn: "",
  endsOn: "",
  roomIds: [] as string[],
  isCommonArea: false,
  type: "ESPORADICA" as TaskType,
});

function openCreateModal() {
  createForm.value = {
    title: "",
    description: "",
    dueDate: "",
    startsOn: "",
    endsOn: "",
    roomIds: [],
    isCommonArea: false,
    type: "ESPORADICA",
  };
  selectedImages.value = [];
  imageInputKey.value += 1;
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
}

function handleImageSelection(files: File[]) {
  selectedImages.value = files;
}

async function saveTask() {
  if (!workspaceStore.activeHotel?.id || !createForm.value.title.trim()) return;

  const payload = {
    hotelId: workspaceStore.activeHotel.id,
    title: createForm.value.title.trim(),
    description: createForm.value.description.trim() || undefined,
    dueDate: createForm.value.dueDate || undefined,
    startsOn: createForm.value.startsOn || undefined,
    endsOn: createForm.value.endsOn || undefined,
    roomIds: createForm.value.roomIds.length ? createForm.value.roomIds : undefined,
    isCommonArea: createForm.value.isCommonArea,
    type: createForm.value.type,
    frequency: createForm.value.type === "ROTINEIRA" ? ("DIARIA" as const) : ("UNICA" as const),
  };

  const created = await taskStore.createTask(payload, selectedImages.value);
  if (created) {
    closeCreateModal();
    await loadData();
  }
}

const isRunModalOpen = ref(false);
const itemNotes = ref<Record<string, string>>({});
const itemImages = ref<Record<string, File[]>>({});

async function openRunModal(runId: string) {
  isRunModalOpen.value = true;
  itemNotes.value = {};
  itemImages.value = {};
  await taskStore.fetchRun(runId);
}

function closeRunModal() {
  isRunModalOpen.value = false;
  taskStore.clearActiveRun();
}

function onItemImagesChange(event: Event, roomId: string) {
  const target = event.target as HTMLInputElement;
  const files = target.files ? Array.from(target.files) : [];
  itemImages.value[roomId] = files;
}

async function markItem(roomId: string, status: TaskStatus) {
  if (!taskStore.activeRun) return;
  await taskStore.updateRunItem(
    taskStore.activeRun.id,
    roomId,
    {
      status,
      note: itemNotes.value[roomId] || undefined,
    },
    itemImages.value[roomId] || [],
  );
  itemNotes.value[roomId] = "";
  itemImages.value[roomId] = [];
  await taskStore.fetchDailyOverview(workspaceStore.activeHotel!.id, selectedDate.value);
}
</script>
