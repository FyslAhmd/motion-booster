'use client';

export type LiveChatGuideLanguage = 'en' | 'bn';
export type LiveChatGuideOptionId = 'boost-request' | 'support' | 'others';

export interface LiveChatGuidedFlowOption {
  id: LiveChatGuideOptionId;
  labelEn: string;
  labelBn: string;
}

interface LiveChatGuidedFlowProps {
  userFullName: string;
  timestampLabel: string;
  selectedLanguage: LiveChatGuideLanguage | null;
  selectedOptionId: LiveChatGuideOptionId | null;
  options: LiveChatGuidedFlowOption[];
  onLanguageSelect: (lang: LiveChatGuideLanguage) => void;
  onOptionSelect: (optionId: LiveChatGuideOptionId) => void;
}

export default function LiveChatGuidedFlow({
  userFullName,
  timestampLabel,
  selectedLanguage,
  selectedOptionId,
  options,
  onLanguageSelect,
  onOptionSelect,
}: LiveChatGuidedFlowProps) {
  const welcomeMessage = `${userFullName}!\nপ্রিয় গ্রাহক অনুগ্রহ করে  অপেক্ষা করুন আমাদের প্রতিনিধি আপনার সঙ্গে খুব দ্রুত যোগাযোগ করবেন।`;

  return (
    <div className="space-y-3 py-3">
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-2.5 shadow-sm">
          <p className="text-sm leading-6 text-gray-700 whitespace-pre-line">{welcomeMessage}</p>
        </div>
      </div>

      <p className="pl-1 text-xs text-gray-400">{timestampLabel}</p>

      <div className="flex justify-start">
        <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-gray-100 bg-white p-3 shadow-sm">
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            <p className="text-sm leading-6 text-gray-700">Please select your preferred language</p>
            <p className="text-sm leading-6 text-gray-700">অনুগ্রহ করে আপনার পছন্দের ভাষা নির্বাচন করুন</p>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onLanguageSelect('en')}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedLanguage === 'en'
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onLanguageSelect('bn')}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedLanguage === 'bn'
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedLanguage && (
        <div className="flex justify-start">
          <div className="w-full max-w-[92%] overflow-hidden rounded-2xl rounded-tl-sm border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700">
              {selectedLanguage === 'bn' ? 'বিষয় নির্বাচন করুন' : 'Please select'}
            </div>
            {options.map((option, index) => {
              const isActive = selectedOptionId === option.id;
              const isLast = index === options.length - 1;
              const label = selectedLanguage === 'bn' ? option.labelBn : option.labelEn;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onOptionSelect(option.id)}
                  className={`w-full px-4 py-3 text-center text-[22px] leading-none font-medium transition-colors md:text-base md:leading-normal ${
                    isActive ? 'bg-red-50 text-red-600' : 'text-[#e91e63] hover:bg-rose-50/70'
                  } ${!isLast ? 'border-b border-gray-200' : ''}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
