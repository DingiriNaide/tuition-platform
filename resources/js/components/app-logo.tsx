import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="size-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 p-0">
                <AppLogoIcon className="w-full h-full text-white" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="truncate font-bold text-emerald-50 text-base leading-tight">Ulama</span>
                <span className="truncate text-xs text-emerald-400">Learning Platform</span>
            </div>
        </>
    );
}