export default function InstallPrompt({ onInstall, onDismiss }) {
    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
            <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-xl">
                <div className="flex items-start gap-4">
                    <div className="text-4xl">📱</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">앱 설치</h3>
                        <p className="text-sm text-primary-50 mb-3">
                            홈 화면에 추가하여 더 편리하게 사용하세요!
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onInstall}
                                className="btn bg-white text-primary-600 hover:bg-primary-50 flex-1"
                            >
                                설치
                            </button>
                            <button
                                onClick={onDismiss}
                                className="btn bg-primary-700 text-white hover:bg-primary-800"
                            >
                                나중에
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
