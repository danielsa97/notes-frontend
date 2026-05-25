<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center gap-3 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ t("tasks.title") }}</h1>
          <p class="text-gray-600">{{ t("tasks.subtitle", { workspace: workspaceName }) }}</p>
        </div>
        <Button @click="openCreateModal">
          <span class="sm:hidden">+</span>
          <span class="hidden sm:inline">{{ t("tasks.add") }}</span>
        </Button>
      </div>

      <Alert
        v-if="taskStore.error"
        type="error"
        :title="t('tasks.errorTitle')"
        :message="taskStore.error"
      />

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-6">
        <div>
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{{ t("tasks.filterAll") }}</option>
            <option value="PENDENTE">{{ t("tasks.statusValues.PENDENTE") }}</option>
            <option value="EM_ANDAMENTO">{{ t("tasks.statusValues.EM_ANDAMENTO") }}</option>
            <option value="CONCLUIDA">{{ t("tasks.statusValues.CONCLUIDA") }}</option>
            <option value="CANCELADA">{{ t("tasks.statusValues.CANCELADA") }}</option>
          </select>
        </div>
        <div>
          <select
            v-model="sortDueDate"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{{ t("tasks.sortDefault") }}</option>
            <option value="asc">{{ t("tasks.sortAsc") }}</option>
            <option value="desc">{{ t("tasks.sortDesc") }}</option>
          </select>
        </div>
      </div>

      <!-- Shimmer loading -->
      <div v-if="taskStore.loading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="bg-white rounded-lg shadow p-4">
          <Shimmer height="1rem" width="50%" class="mb-2" />
          <Shimmer height="0.75rem" width="70%" class="mb-3" />
          <div class="flex gap-2">
            <Shimmer height="1.5rem" width="80px" rounded="full" />
            <Shimmer height="1.5rem" width="80px" rounded="full" />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="taskStore.tasks.length === 0"
        class="bg-white rounded-lg shadow px-4 py-10 text-center text-gray-500"
      >
        {{ t("tasks.empty") }}
      </div>

      <!-- Task List -->
      <div v-else class="space-y-4">
        <Card
          v-for="task in taskStore.tasks"
          :key="task.id"
          class="hover:shadow-md transition cursor-pointer"
          @click="openDetailModal(task.id)"
        >
          <div class="flex items-start gap-4">
            <!-- Status indicator -->
            <div class="pt-0.5">
              <span
                class="inline-block w-3 h-3 rounded-full mt-1"
                :class="statusDotClass(task.status)"
              />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h3 class="text-base font-semibold text-gray-900 truncate">{{ task.title }}</h3>
                <Badge :variant="statusVariant(task.status)">
                  {{ t(`tasks.statusValues.${task.status}`) }}
                </Badge>
              </div>

              <p v-if="task.description" class="text-sm text-gray-600 mb-2 line-clamp-2">
                {{ task.description }}
              </p>

              <div class="flex flex-wrap gap-3 text-xs text-gray-500">
                <!-- Due date -->
                <span v-if="task.due_date" :class="isOverdue(task) ? 'text-red-600 font-medium' : ''">
                  {{ t("tasks.dueDate") }}: {{ formatDate(task.due_date) }}
                  <span v-if="isOverdue(task)"> — {{ t("tasks.overdue") }}</span>
                </span>
                <span v-else class="italic">{{ t("tasks.noDueDate") }}</span>

                <!-- Rooms -->
                <span v-if="task.is_common_area" class="text-purple-600">
                  📍 {{ t("tasks.commonAreaLabel") }}
                </span>
                <span v-if="task.rooms.length">
                  🛏 {{ task.rooms.map((r) => r.room.room_id).join(", ") }}
                </span>

                <!-- Creator -->
                <span>{{ t("tasks.createdBy", { name: task.created_by.full_name }) }}</span>
              </div>
            </div>

            <!-- Images indicator -->
            <div v-if="task.image_urls.length" class="text-xs text-gray-400 shrink-0">
              🖼 {{ task.image_urls.length }}
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- ===== CREATE TASK MODAL ===== -->
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
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t("tasks.form.description") }}
          </label>
          <textarea
            v-model="createForm.description"
            :placeholder="t('tasks.form.descriptionPlaceholder')"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <Input
          v-model="createForm.dueDate"
          :label="t('tasks.form.dueDate')"
          type="date"
        />

        <!-- Room assignment -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t("tasks.form.rooms") }}
          </label>
          <p class="text-xs text-gray-500 mb-2">{{ t("tasks.form.roomsHint") }}</p>

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
              <span class="text-sm text-gray-700">
                {{ room.room_id }}
                <span class="text-gray-400 text-xs">({{ t(`rooms.typeValues.${room.type}`) }})</span>
              </span>
            </label>
            <p v-if="enabledRooms.length === 0" class="text-sm text-gray-400 px-1">
              {{ t("tasks.noRooms") }}
            </p>
          </div>

          <label class="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="createForm.isCommonArea"
              class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span class="text-sm text-gray-700">{{ t("tasks.form.isCommonArea") }}</span>
          </label>
          <p v-if="createForm.isCommonArea" class="text-xs text-purple-600 mt-1">
            {{ t("tasks.commonAreaHint") }}
          </p>
        </div>

        <!-- Images -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t("tasks.imageUploadLabel") }}
          </label>
          <ImagePicker
            :key="imageInputKey"
            :maxFiles="5"
            :disabled="taskStore.loading"
            @files-selected="handleImageSelection"
          />
          <p class="text-xs text-gray-500 mt-1">{{ t("tasks.imageUploadHint") }}</p>
          <div v-if="imagePreviews.length" class="grid grid-cols-3 gap-2 mt-3">
            <img
              v-for="preview in imagePreviews"
              :key="preview"
              :src="preview"
              class="h-20 w-full object-cover rounded-md border border-gray-200"
            />
          </div>
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

    <!-- ===== TASK DETAIL MODAL ===== -->
    <Modal
      :isOpen="isDetailModalOpen"
      :title="t('tasks.modalDetailTitle')"
      @close="closeDetailModal"
    >
      <div v-if="taskStore.loadingDetail" class="space-y-3">
        <Shimmer height="1.5rem" width="60%" />
        <Shimmer height="1rem" width="80%" />
        <Shimmer height="1rem" width="40%" />
      </div>

      <div v-else-if="taskStore.activeTask" class="space-y-5">
        <!-- Title + Status -->
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-lg font-bold text-gray-900">{{ taskStore.activeTask.title }}</h2>
          <Badge :variant="statusVariant(taskStore.activeTask.status)">
            {{ t(`tasks.statusValues.${taskStore.activeTask.status}`) }}
          </Badge>
        </div>

        <!-- Description -->
        <p v-if="taskStore.activeTask.description" class="text-sm text-gray-600">
          {{ taskStore.activeTask.description }}
        </p>

        <!-- Meta info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{{ t("tasks.dueDate") }}</p>
            <p
              class="font-medium"
              :class="isOverdue(taskStore.activeTask) ? 'text-red-600' : 'text-gray-700'"
            >
              {{ taskStore.activeTask.due_date ? formatDate(taskStore.activeTask.due_date) : t("tasks.noDueDate") }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{{ t("tasks.createdBy", { name: '' }) }}</p>
            <p class="font-medium text-gray-700">{{ taskStore.activeTask.created_by.full_name }}</p>
          </div>
          <div v-if="taskStore.activeTask.completed_at">
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Conclusão</p>
            <p class="font-medium text-green-600">{{ formatDate(taskStore.activeTask.completed_at) }}</p>
          </div>
        </div>

        <!-- Rooms -->
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">{{ t("tasks.rooms") }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-if="taskStore.activeTask.is_common_area"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700"
            >
              📍 {{ t("tasks.commonAreaLabel") }}
            </span>
            <span
              v-for="tr in taskStore.activeTask.rooms"
              :key="tr.room_id"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
            >
              🛏 {{ tr.room.room_id }}
            </span>
            <span
              v-if="!taskStore.activeTask.is_common_area && !taskStore.activeTask.rooms.length"
              class="text-sm text-gray-400 italic"
            >
              {{ t("tasks.noRooms") }}
            </span>
          </div>
        </div>

        <!-- Task images -->
        <div v-if="taskStore.activeTask.image_urls.length">
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-2">Imagens</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="(url, idx) in taskStore.activeTask.image_urls"
              :key="url"
              type="button"
              @click="openImagePreview(taskStore.activeTask!.image_urls, idx)"
              class="h-20 rounded-md overflow-hidden border border-gray-200 hover:opacity-80 transition"
            >
              <img :src="url" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Status actions -->
        <div
          v-if="taskStore.activeTask.status !== 'CONCLUIDA' && taskStore.activeTask.status !== 'CANCELADA'"
          class="flex flex-wrap gap-2"
        >
          <button
            v-if="taskStore.activeTask.status === 'PENDENTE'"
            type="button"
            @click="changeStatus('EM_ANDAMENTO')"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {{ t("tasks.actions.markInProgress") }}
          </button>
          <button
            type="button"
            @click="changeStatus('CONCLUIDA')"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition"
          >
            {{ t("tasks.actions.markDone") }}
          </button>
          <button
            type="button"
            @click="changeStatus('CANCELADA')"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            {{ t("tasks.actions.markCancelled") }}
          </button>
        </div>

        <!-- Comments section -->
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide mb-3">{{ t("tasks.comments.title") }}</p>

          <div v-if="!taskStore.activeTask.comments?.length" class="text-sm text-gray-400 italic mb-3">
            {{ t("tasks.comments.empty") }}
          </div>

          <div v-else class="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
            <div
              v-for="comment in taskStore.activeTask.comments"
              :key="comment.id"
              class="bg-gray-50 rounded-lg p-3"
            >
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-semibold text-gray-700">{{ comment.user.full_name }}</span>
                <span class="text-xs text-gray-400">{{ formatDatetime(comment.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-700">{{ comment.body }}</p>
              <div v-if="comment.image_urls.length" class="grid grid-cols-4 gap-1 mt-2">
                <button
                  v-for="(url, idx) in comment.image_urls"
                  :key="url"
                  type="button"
                  @click="openImagePreview(comment.image_urls, idx)"
                  class="h-14 rounded overflow-hidden border border-gray-200 hover:opacity-80 transition"
                >
                  <img :src="url" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>
          </div>

          <!-- Add comment form -->
          <div class="border-t border-gray-100 pt-3 space-y-2">
            <textarea
              v-model="commentBody"
              :placeholder="t('tasks.comments.addPlaceholder')"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ t("tasks.comments.addEvidence") }}</label>
              <ImagePicker
                :key="commentImageKey"
                :maxFiles="5"
                :disabled="addingComment"
                @files-selected="handleCommentImageSelection"
              />
              <div v-if="commentPreviews.length" class="grid grid-cols-4 gap-1 mt-2">
                <img
                  v-for="preview in commentPreviews"
                  :key="preview"
                  :src="preview"
                  class="h-14 w-full object-cover rounded border border-gray-200"
                />
              </div>
            </div>
            <div class="flex justify-end">
              <Button
                size="sm"
                :loading="addingComment"
                :disabled="!commentBody.trim() || addingComment"
                @click="submitComment"
              >
                {{ t("tasks.comments.addButton") }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button variant="ghost" @click="closeDetailModal">
          {{ t("common.close") }}
        </Button>
      </template>
    </Modal>

    <!-- Image lightbox -->
    <ImagePreviewLightbox
      :isOpen="isImagePreviewOpen"
      :images="previewImages"
      :startIndex="previewStartIndex"
      alt="Imagem da tarefa"
      @close="closeImagePreview"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { Task, TaskStatus } from "@/core/utils/types";
import { useWorkspaceStore } from "@/modules/hotels/ui/stores/workspaceStore";
import { useRoomStore } from "@/modules/rooms/ui/stores/roomStore";
import { useTaskStore } from "@/modules/tasks/ui/stores/taskStore";
import AppLayout from "@/shared/layouts/AppLayout.vue";
import Alert from "@/shared/components/Alert.vue";
import Badge from "@/shared/components/Badge.vue";
import Button from "@/shared/components/Button.vue";
import Card from "@/shared/components/Card.vue";
import FormGroup from "@/shared/components/FormGroup.vue";
import Input from "@/shared/components/Input.vue";
import ImagePicker from "@/shared/components/ImagePicker.vue";
import ImagePreviewLightbox from "@/shared/components/ImagePreviewLightbox.vue";
import Modal from "@/shared/components/Modal.vue";
import Shimmer from "@/shared/components/Shimmer.vue";

const { t } = useI18n();
const workspaceStore = useWorkspaceStore();
const roomStore = useRoomStore();
const taskStore = useTaskStore();

const workspaceName = computed(() => workspaceStore.activeHotel?.name ?? "-");
const enabledRooms = computed(() =>
  roomStore.rooms.filter((r) => r.status === "ENABLED"),
);

// --- Filters ---
const filterStatus = ref<TaskStatus | "">("");
const sortDueDate = ref<"asc" | "desc" | "">("");

async function loadTasks() {
  if (!workspaceStore.activeHotel) return;
  await taskStore.fetchTasks(workspaceStore.activeHotel.id, {
    status: filterStatus.value || undefined,
    orderByDueDate: sortDueDate.value || undefined,
  });
}

watch([filterStatus, sortDueDate], loadTasks);

onMounted(async () => {
  if (!workspaceStore.activeHotel) return;
  await Promise.all([
    roomStore.fetchRooms(workspaceStore.activeHotel.id),
    loadTasks(),
  ]);
});

// --- Create Modal ---
const isCreateModalOpen = ref(false);
const selectedImages = ref<File[]>([]);
const imagePreviews = ref<string[]>([]);
const imageInputKey = ref(0);

const createForm = ref({
  title: "",
  description: "",
  dueDate: "",
  roomIds: [] as string[],
  isCommonArea: false,
});

function openCreateModal() {
  createForm.value = {
    title: "",
    description: "",
    dueDate: "",
    roomIds: [],
    isCommonArea: false,
  };
  selectedImages.value = [];
  imagePreviews.value = [];
  imageInputKey.value++;
  isCreateModalOpen.value = true;
}

function closeCreateModal() {
  isCreateModalOpen.value = false;
}

function handleImageSelection(files: File[]) {
  selectedImages.value = files;
  imagePreviews.value = files.map((f) => URL.createObjectURL(f));
}

async function saveTask() {
  if (!createForm.value.title.trim() || !workspaceStore.activeHotel) return;

  const task = await taskStore.createTask(
    {
      hotelId: workspaceStore.activeHotel.id,
      title: createForm.value.title.trim(),
      description: createForm.value.description.trim() || undefined,
      dueDate: createForm.value.dueDate || undefined,
      roomIds:
        createForm.value.roomIds.length > 0
          ? createForm.value.roomIds
          : undefined,
      isCommonArea: createForm.value.isCommonArea,
    },
    selectedImages.value,
  );

  if (task) {
    closeCreateModal();
  }
}

// --- Detail Modal ---
const isDetailModalOpen = ref(false);
const commentBody = ref("");
const commentImages = ref<File[]>([]);
const commentPreviews = ref<string[]>([]);
const commentImageKey = ref(0);
const addingComment = ref(false);

async function openDetailModal(taskId: string) {
  isDetailModalOpen.value = true;
  commentBody.value = "";
  commentImages.value = [];
  commentPreviews.value = [];
  commentImageKey.value++;
  await taskStore.fetchTask(taskId);
}

function closeDetailModal() {
  isDetailModalOpen.value = false;
  taskStore.clearActiveTask();
}

async function changeStatus(status: "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA") {
  if (!taskStore.activeTask) return;
  await taskStore.updateStatus(taskStore.activeTask.id, status);
}

function handleCommentImageSelection(files: File[]) {
  commentImages.value = files;
  commentPreviews.value = files.map((f) => URL.createObjectURL(f));
}

async function submitComment() {
  if (!commentBody.value.trim() || !taskStore.activeTask) return;
  addingComment.value = true;
  await taskStore.addComment(
    taskStore.activeTask.id,
    commentBody.value.trim(),
    commentImages.value,
  );
  commentBody.value = "";
  commentImages.value = [];
  commentPreviews.value = [];
  commentImageKey.value++;
  addingComment.value = false;
}

// --- Image lightbox ---
const isImagePreviewOpen = ref(false);
const previewImages = ref<string[]>([]);
const previewStartIndex = ref(0);

function openImagePreview(images: string[], index: number) {
  previewImages.value = images;
  previewStartIndex.value = index;
  isImagePreviewOpen.value = true;
}

function closeImagePreview() {
  isImagePreviewOpen.value = false;
}

// --- Helpers ---
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function formatDatetime(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(task: Task) {
  if (!task.due_date) return false;
  if (task.status === "CONCLUIDA" || task.status === "CANCELADA") return false;
  return new Date(task.due_date) < new Date();
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

function statusDotClass(status: TaskStatus) {
  const map: Record<TaskStatus, string> = {
    PENDENTE: "bg-yellow-400",
    EM_ANDAMENTO: "bg-blue-500",
    CONCLUIDA: "bg-green-500",
    CANCELADA: "bg-gray-400",
  };
  return map[status] ?? "bg-gray-300";
}
</script>
