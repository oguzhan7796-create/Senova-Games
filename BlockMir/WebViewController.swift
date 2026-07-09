import UIKit
import WebKit
import PhotosUI
import StoreKit

final class WebViewController: UIViewController {
    private var webView: WKWebView!
    private let bridgeName = "BlockMirNative"

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.09, green: 0.02, blue: 0.12, alpha: 1)
        configureWebView()
        loadGame()
    }

    override var prefersStatusBarHidden: Bool { true }
    override var prefersHomeIndicatorAutoHidden: Bool { true }

    func resumeWebView() {
        webView?.configuration.userContentController.removeAllScriptMessageHandlers()
        webView?.configuration.userContentController.add(self, name: bridgeName)
        webView?.evaluateJavaScript("try{window.dispatchEvent(new Event('resize'));}catch(e){}", completionHandler: nil)
    }

    func pauseWebView() {
        webView?.evaluateJavaScript("try{window.BlockMirSaveRun&&window.BlockMirSaveRun()}catch(e){}", completionHandler: nil)
    }

    private func configureWebView() {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.preferences.javaScriptCanOpenWindowsAutomatically = false
        if #available(iOS 14.0, *) {
            config.defaultWebpagePreferences.allowsContentJavaScript = true
        }

        let deviceJSON = BlockMirDeviceInfo.jsonString()
        let bridgeScript = WKUserScript(
            source: BlockMirJSBridge.bootstrapScript(deviceJSON: deviceJSON, handlerName: bridgeName),
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        config.userContentController.addUserScript(bridgeScript)
        config.userContentController.add(self, name: bridgeName)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        if #available(iOS 11.0, *) {
            webView.scrollView.contentInsetAdjustmentBehavior = .never
        }
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])
        self.webView = webView
    }

    private func loadGame() {
        guard let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") else {
            showMissingWWWAlert()
            return
        }
        let folder = indexURL.deletingLastPathComponent()
        webView.loadFileURL(indexURL, allowingReadAccessTo: folder)
    }

    private func showMissingWWWAlert() {
        let alert = UIAlertController(
            title: "www eksik",
            message: "Once SYNC_WEBAPP.bat calistirin (Windows) veya Mac'te www klasorunu ekleyin.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "Tamam", style: .default))
        present(alert, animated: true)
    }

    private func runJS(_ script: String) {
        webView?.evaluateJavaScript(script, completionHandler: nil)
    }

    private func openPhotoPicker() {
        if #available(iOS 14.0, *) {
            var config = PHPickerConfiguration(photoLibrary: .shared())
            config.filter = .images
            config.selectionLimit = 1
            let picker = PHPickerViewController(configuration: config)
            picker.delegate = self
            present(picker, animated: true)
        } else {
            runJS("window.BlockMirPhotoPickFailed&&window.BlockMirPhotoPickFailed();")
        }
    }

    private func haptic(_ type: String) {
        let style: UIImpactFeedbackGenerator.FeedbackStyle
        switch type {
        case "bad": style = .rigid
        case "clear", "combo": style = .medium
        case "win", "reward": style = .heavy
        default: style = .light
        }
        UIImpactFeedbackGenerator(style: style).impactOccurred()
    }

    private func requestReview() {
        if #available(iOS 14.0, *) {
            if let scene = view.window?.windowScene {
                SKStoreReviewController.requestReview(in: scene)
            } else {
                SKStoreReviewController.requestReview()
            }
        } else {
            SKStoreReviewController.requestReview()
        }
        runJS("window.BlockMirReviewFinished&&window.BlockMirReviewFinished();")
    }

    private func openAppStoreReview() {
        let appId = Bundle.main.object(forInfoDictionaryKey: "BlockMirAppStoreId") as? String ?? ""
        if let url = URL(string: "https://apps.apple.com/app/id\(appId)?action=write-review"), !appId.isEmpty {
            UIApplication.shared.open(url)
        } else if let url = URL(string: "itms-apps://itunes.apple.com/app/id\(appId)?action=write-review"), !appId.isEmpty {
            UIApplication.shared.open(url)
        }
    }

    private func shareText(_ text: String) {
        let vc = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        vc.popoverPresentationController?.sourceView = view
        present(vc, animated: true)
    }

    private func shareImage(_ dataUrl: String, text: String) {
        guard let image = BlockMirImageTools.image(fromDataURL: dataUrl) else {
            shareText(text)
            return
        }
        let vc = UIActivityViewController(activityItems: [image, text], applicationActivities: nil)
        vc.popoverPresentationController?.sourceView = view
        present(vc, animated: true)
    }

    private func notifyPlayGamesStatus(_ status: String) {
        let quoted = NSString(string: status)
        runJS("window.BlockMirPlayGamesStatus&&window.BlockMirPlayGamesStatus(\(quoted));")
    }

    private func deliverPhotoDataURL(_ dataUrl: String) {
        let quoted = NSString(string: dataUrl)
        runJS("window.BlockMirReceiveAndroidPhoto&&window.BlockMirReceiveAndroidPhoto(\(quoted));")
    }
}

extension WebViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == bridgeName,
              let body = message.body as? [String: Any],
              let method = body["method"] as? String else { return }

        switch method {
        case "pickPhoto":
            openPhotoPicker()
        case "vibrate":
            let ms = body["ms"] as? Int ?? 80
            let type = ms >= 220 ? "win" : ms >= 140 ? "combo" : ms >= 95 ? "clear" : "bad"
            haptic(type)
        case "vibratePattern":
            haptic(body["type"] as? String ?? "tap")
        case "requestReview":
            requestReview()
        case "openStoreReview":
            openAppStoreReview()
        case "shareText":
            shareText(body["text"] as? String ?? "BlockMir")
        case "shareImage":
            shareImage(body["dataUrl"] as? String ?? "", text: body["text"] as? String ?? "BlockMir")
        case "submitScore", "showLeaderboard":
            // Game Center v1.1 — oyun calisir, siralama iOS'ta sonra
            notifyPlayGamesStatus("sign_in_failed")
        default:
            break
        }
    }
}

extension WebViewController: PHPickerViewControllerDelegate {
    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)
        guard let item = results.first else {
            runJS("window.BlockMirPhotoPickFailed&&window.BlockMirPhotoPickFailed();")
            return
        }
        item.itemProvider.loadObject(ofClass: UIImage.self) { [weak self] object, _ in
            DispatchQueue.main.async {
                guard let self, let image = object as? UIImage,
                      let dataUrl = BlockMirImageTools.jpegDataURL(from: image) else {
                    self?.runJS("window.BlockMirPhotoPickFailed&&window.BlockMirPhotoPickFailed();")
                    return
                }
                self.deliverPhotoDataURL(dataUrl)
            }
        }
    }
}
