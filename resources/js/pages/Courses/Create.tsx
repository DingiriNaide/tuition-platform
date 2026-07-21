import { Head, useForm } from '@inertiajs/react';
import { store } from '@/actions/App/Http/Controllers/CourseController';
import { FormEvent } from 'react';
import LoadingOverlay from '@/components/LoadingOverlay';

// ── Types ─────────────────────────────────────────────────────────────

interface Subject {
    id: number;
    name: string;
    name_sinhala: string | null;
    name_tamil: string | null;
    syllabus: string;
}

interface Props {
    subjects: Subject[];
    gradeOptions: Record<string, string>;
    syllabusOptions: Record<string, string>;
    mediumOptions: Record<string, string>;
}

interface CourseForm {
    subject_id: string;
    title: string;
    title_sinhala: string;
    title_tamil: string;
    description: string;
    description_sinhala: string;
    description_tamil: string;
    grade: string;
    syllabus: string;
    medium: string;
    price_per_session: string;
    price_monthly: string;
    max_students: string;
    is_group: boolean;
    is_active: boolean;
    thumbnail: File | null;
}

// ── Component ─────────────────────────────────────────────────────────

export default function CourseCreate({
    subjects,
    gradeOptions,
    syllabusOptions,
    mediumOptions,
}: Props) {
    const { data, setData, post, processing, errors } = useForm<CourseForm>({
        subject_id: '',
        title: '',
        title_sinhala: '',
        title_tamil: '',
        description: '',
        description_sinhala: '',
        description_tamil: '',
        grade: '',
        syllabus: '',
        medium: '',
        price_per_session: '',
        price_monthly: '',
        max_students: '30',
        is_group: true,
        is_active: true,
        thumbnail: null,
    });

    /* function submit(e: FormEvent): void {
        e.preventDefault();
        post(store.url(), { forceFormData: true });
    } */
   function submit(e: FormEvent): void {
        e.preventDefault();
        post(store.url(), {
            forceFormData: true,
            onError: (errors) => console.log('Validation errors:', errors),
        });
    }

    return (
        <>
            <div className="max-w-2xl mx-auto p-6 relative">
                <LoadingOverlay show={processing} message="Creating Course…" variant="card" />
                    <Head title="Create Course" />

                    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                            Create New Course
                        </h1>

                        <form onSubmit={submit} className="space-y-6">
                            <FormCard title="Course Details">

                                {/* Subject */}
                                <Field label="Subject" error={errors.subject_id} required>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className={selectClass(!!errors.subject_id)}
                                    >
                                        <option value="">Select subject</option>
                                        {subjects.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                                {s.name_sinhala ? ` · ${s.name_sinhala}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Thumbnail */}
                                <Field label="Thumbnail" error={errors.thumbnail}>
                                    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-emerald-400 dark:border-gray-600">
                                        {data.thumbnail ? (
                                            <img
                                                src={URL.createObjectURL(data.thumbnail)}
                                                alt="Preview"
                                                className="h-12 w-20 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-20 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 dark:bg-gray-700">
                                                No image
                                            </div>
                                        )}
                                        <span>{data.thumbnail ? data.thumbnail.name : 'Upload a course thumbnail'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => setData('thumbnail', e.target.files?.[0] ?? null)}
                                        />
                                    </label>
                                </Field>

                                {/* Title (English) */}
                                <Field label="Title (English)" error={errors.title} required>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className={inputClass(!!errors.title)}
                                        placeholder="e.g. Combined Maths — A/L 2025 Batch"
                                    />
                                </Field>

                                {/* Title (Sinhala) */}
                                <Field label="Title (Sinhala)" error={errors.title_sinhala}>
                                    <input
                                        type="text"
                                        value={data.title_sinhala}
                                        onChange={(e) => setData('title_sinhala', e.target.value)}
                                        className={inputClass(!!errors.title_sinhala)}
                                    />
                                </Field>

                                {/* Title (Tamil) */}
                                <Field label="Title (Tamil)" error={errors.title_tamil}>
                                    <input
                                        type="text"
                                        value={data.title_tamil}
                                        onChange={(e) => setData('title_tamil', e.target.value)}
                                        className={inputClass(!!errors.title_tamil)}
                                    />
                                </Field>

                                {/* Description (English) */}
                                <Field label="Description (English)" error={errors.description}>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className={inputClass(!!errors.description)}
                                        placeholder="Describe what students will learn, schedule, materials..."
                                    />
                                </Field>

                                {/* Description (Sinhala) */}
                                <Field label="Description (Sinhala)" error={errors.description_sinhala}>
                                    <textarea
                                        value={data.description_sinhala}
                                        onChange={(e) => setData('description_sinhala', e.target.value)}
                                        rows={3}
                                        className={inputClass(!!errors.description_sinhala)}
                                    />
                                </Field>

                                {/* Description (Tamil) */}
                                <Field label="Description (Tamil)" error={errors.description_tamil}>
                                    <textarea
                                        value={data.description_tamil}
                                        onChange={(e) => setData('description_tamil', e.target.value)}
                                        rows={3}
                                        className={inputClass(!!errors.description_tamil)}
                                    />
                                </Field>
                            </FormCard>

                            <FormCard title="Academic Details">

                                {/* Grade */}
                                <Field label="Grade" error={errors.grade} required>
                                    <select
                                        value={data.grade}
                                        onChange={(e) => setData('grade', e.target.value)}
                                        className={selectClass(!!errors.grade)}
                                    >
                                        <option value="">Select grade</option>
                                        {Object.entries(gradeOptions).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Syllabus */}
                                <Field label="Syllabus" error={errors.syllabus} required>
                                    <select
                                        value={data.syllabus}
                                        onChange={(e) => setData('syllabus', e.target.value)}
                                        className={selectClass(!!errors.syllabus)}
                                    >
                                        <option value="">Select syllabus</option>
                                        {Object.entries(syllabusOptions).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Medium */}
                                <Field label="Teaching Medium" error={errors.medium} required>
                                    <select
                                        value={data.medium}
                                        onChange={(e) => setData('medium', e.target.value)}
                                        className={selectClass(!!errors.medium)}
                                    >
                                        <option value="">Select medium</option>
                                        {Object.entries(mediumOptions).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </Field>
                            </FormCard>

                            <FormCard title="Pricing & Capacity">

                                {/* Price per session */}
                                <Field label="Price per Session (LKR)" error={errors.price_per_session}>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">
                                            LKR
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.price_per_session}
                                            onChange={(e) => setData('price_per_session', e.target.value)}
                                            className={`${inputClass(!!errors.price_per_session)} pl-12`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </Field>

                                {/* Monthly price */}
                                <Field label="Monthly Price (LKR)" error={errors.price_monthly}>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">
                                            LKR
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.price_monthly}
                                            onChange={(e) => setData('price_monthly', e.target.value)}
                                            className={`${inputClass(!!errors.price_monthly)} pl-12`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </Field>

                                {/* Max students */}
                                <Field label="Maximum Students" error={errors.max_students} required>
                                    <input
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={data.max_students}
                                        onChange={(e) => setData('max_students', e.target.value)}
                                        className={inputClass(!!errors.max_students)}
                                    />
                                </Field>

                                {/* Group / Private toggle */}
                                <div className="flex items-center gap-3">
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_group}
                                            onChange={(e) => setData('is_group', e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full dark:bg-gray-600" />
                                    </label>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {data.is_group ? 'Group class' : 'Private / 1-on-1 class'}
                                    </span>
                                </div>

                                {/* Active toggle */}
                                <div className="flex items-center gap-3">
                                    <label className="relative inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full dark:bg-gray-600" />
                                    </label>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {data.is_active ? 'Course is active (visible to students)' : 'Course is inactive (hidden)'}
                                    </span>
                                </div>
                            </FormCard>

                            {/* Submit */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {processing ? 'Creating…' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
            </div>
        </>
    );
}

// ── Shared form utilities ─────────────────────────────────────────────

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({
    label,
    error,
    required,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function inputClass(hasError: boolean): string {
    return [
        'block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2',
        hasError
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white',
    ].join(' ');
}

function selectClass(hasError: boolean): string {
    return inputClass(hasError);
}
