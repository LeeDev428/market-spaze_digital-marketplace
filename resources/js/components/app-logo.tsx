import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-14 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <img
                    src="/img/marketspaze_favicon.png"
                    alt="MarketspaZe Logo"
                    className="size-12 object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">MarketspaZe</span>
            </div>
        </>
    );
}
