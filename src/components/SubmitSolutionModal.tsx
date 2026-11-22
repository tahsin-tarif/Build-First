import { Upload, X } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { SOLUTION_IMAGES } from '../data/seedData';
import type {
  CurrencyCode,
  LicensingModel,
  Problem,
} from '../types/marketplace';
import {
  LICENSING_MODELS,
  validateSolutionInput,
  type SolutionInput,
} from '../utils/marketplaceLogic';

interface SubmitSolutionModalProps {
  isOpen: boolean;
  problem: Problem | null;
  onClose: () => void;
  onSubmitSolution: (
    problemId: string,
    payload: SolutionInput & {
      screenshotUrl: string;
      priceCurrency: CurrencyCode;
    }
  ) => void;
}

export function SubmitSolutionModal({
  isOpen,
  problem,
  onClose,
  onSubmitSolution,
}: SubmitSolutionModalProps) {
  const [title, setTitle] = useState('');
  const [pitch, setPitch] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('https://');
  const [videoUrl, setVideoUrl] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>(SOLUTION_IMAGES.retail);
  const [licensingModel, setLicensingModel] = useState<LicensingModel>(
    'Multi-User License (SaaS/Template)'
  );
  const [priceAmount, setPriceAmount] = useState('49');
  const [priceCurrency, setPriceCurrency] = useState<CurrencyCode>('USD');
  const [techStackRaw, setTechStackRaw] = useState('React, TypeScript, Tailwind CSS');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen || !problem) return null;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScreenshotUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const isFree = licensingModel === 'Free / Open-Source Portfolio Project';
    const parsedPrice = isFree ? 0 : Number(priceAmount);
    const techStack = techStackRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);

    const input: SolutionInput = {
      title,
      pitch,
      liveDemoUrl,
      videoUrl,
      licensingModel,
      priceAmount: parsedPrice,
      techStack,
    };

    const validationErrors = validateSolutionInput(input);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmitSolution(problem.id, {
      ...input,
      screenshotUrl,
      priceCurrency,
    });
    setTitle('');
    setPitch('');
    setLiveDemoUrl('https://');
    setVideoUrl('');
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-solution-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl my-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="submit-solution-title"
              className="font-display text-xl font-bold text-slate-900 dark:text-white"
            >
              Submit Finished Solution
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
              Solving: {problem.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Submit Solution modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="solution-title-input"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Solution Title
            </label>
            <input
              id="solution-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. InvoiceSync — 1-Click Supplier PDF to Sheet Parser"
              className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="solution-pitch-input"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Short Pitch (How this solves the problem)
            </label>
            <textarea
              id="solution-pitch-input"
              rows={3}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Explain what the poster can test in the live demo right now..."
              className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            />
            {errors.pitch && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.pitch}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="solution-demo-url"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Live Demo URL (Vercel / Netlify)
              </label>
              <input
                id="solution-demo-url"
                type="url"
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                placeholder="https://my-solution-demo.vercel.app"
                className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
              />
              {errors.liveDemoUrl && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.liveDemoUrl}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="solution-video-url"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Video Walkthrough URL (Loom / YouTube)
              </label>
              <input
                id="solution-video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.loom.com/share/..."
                className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
              />
              {errors.videoUrl && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.videoUrl}
                </p>
              )}
            </div>
          </div>

          {/* Screenshot Upload / Preview */}
          <div>
            <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              Screenshot Preview
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {screenshotUrl && (
                <img
                  src={screenshotUrl}
                  alt="Solution preview"
                  className="h-20 w-28 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                />
              )}
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Screenshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Or preset:</span>
                  <button
                    type="button"
                    onClick={() => setScreenshotUrl(SOLUTION_IMAGES.retail)}
                    className="underline hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Retail UI
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenshotUrl(SOLUTION_IMAGES.tutor)}
                    className="underline hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Education UI
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenshotUrl(SOLUTION_IMAGES.ecommerce)}
                    className="underline hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    E-com UI
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Licensing */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label
                htmlFor="solution-licensing-select"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Pricing &amp; Licensing Model
              </label>
              <select
                id="solution-licensing-select"
                value={licensingModel}
                onChange={(e) =>
                  setLicensingModel(e.target.value as LicensingModel)
                }
                className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
              >
                {LICENSING_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {licensingModel !== 'Free / Open-Source Portfolio Project' && (
              <>
                <div className="sm:col-span-4">
                  <label
                    htmlFor="solution-price-input"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Asking Price
                  </label>
                  <input
                    id="solution-price-input"
                    type="number"
                    min="1"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="solution-currency-select"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Currency
                  </label>
                  <select
                    id="solution-currency-select"
                    value={priceCurrency}
                    onChange={(e) =>
                      setPriceCurrency(e.target.value as CurrencyCode)
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="BDT">BDT</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </>
            )}
            {errors.priceAmount && (
              <p className="sm:col-span-12 text-xs text-red-600 dark:text-red-400">
                {errors.priceAmount}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="solution-stack-input"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Tech Stack (comma-separated)
            </label>
            <input
              id="solution-stack-input"
              type="text"
              value={techStackRaw}
              onChange={(e) => setTechStackRaw(e.target.value)}
              placeholder="React, TypeScript, Supabase"
              className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Submit &amp; Notify Poster
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
