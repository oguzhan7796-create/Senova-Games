import UIKit

enum BlockMirDeviceInfo {
    static func jsonString() -> String {
        let screen = UIScreen.main.bounds
        let scale = UIScreen.main.scale
        let info: [String: Any] = [
            "manufacturer": "Apple",
            "model": UIDevice.current.model,
            "device": UIDevice.current.name,
            "product": "iOS",
            "sdk": Int(UIDevice.current.systemVersion.split(separator: ".").first ?? "0") ?? 0,
            "width": Int(screen.width * scale),
            "height": Int(screen.height * scale),
            "densityDpi": Int(160 * scale),
            "ramMb": ProcessInfo.processInfo.physicalMemory / (1024 * 1024),
            "lowRam": false,
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: info),
              let json = String(data: data, encoding: .utf8) else {
            return "{}"
        }
        return json
    }
}

enum BlockMirJSBridge {
    static func bootstrapScript(deviceJSON: String, handlerName: String) -> String {
        """
        (function(){
          var handler = '\(handlerName)';
          window.__bmDevice = \(deviceJSON);
          function post(method, payload) {
            payload = payload || {};
            payload.method = method;
            try { window.webkit.messageHandlers[handler].postMessage(payload); } catch (e) {}
          }
          window.BlockMirAndroid = {
            getDeviceInfo: function(){ return JSON.stringify(window.__bmDevice || {}); },
            pickPhoto: function(){ post('pickPhoto'); },
            vibrate: function(ms){ post('vibrate', { ms: ms|0 }); },
            vibratePattern: function(type){ post('vibratePattern', { type: String(type||'tap') }); },
            requestReview: function(){ post('requestReview'); },
            openStoreReview: function(){ post('openStoreReview'); },
            submitScore: function(mod, score){ post('submitScore', { mod: String(mod||''), score: score|0 }); },
            showLeaderboard: function(mod){ post('showLeaderboard', { mod: String(mod||'') }); },
            shareText: function(text){ post('shareText', { text: String(text||'') }); },
            shareImage: function(dataUrl, text){ post('shareImage', { dataUrl: String(dataUrl||''), text: String(text||'') }); }
          };
        })();
        """
    }
}

enum BlockMirImageTools {
    static func image(fromDataURL dataUrl: String) -> UIImage? {
        guard let comma = dataUrl.firstIndex(of: ",") else { return nil }
        let base64 = String(dataUrl[dataUrl.index(after: comma)...])
        guard let data = Data(base64Encoded: base64) else { return nil }
        return UIImage(data: data)
    }

    static func jpegDataURL(from image: UIImage, maxSide: CGFloat = 1320, quality: CGFloat = 0.82) -> String? {
        let maxDimension = max(image.size.width, image.size.height)
        var output = image
        if maxDimension > maxSide {
            let scale = maxSide / maxDimension
            let size = CGSize(width: image.size.width * scale, height: image.size.height * scale)
            UIGraphicsBeginImageContextWithOptions(size, true, 1)
            image.draw(in: CGRect(origin: .zero, size: size))
            output = UIGraphicsGetImageFromCurrentImageContext() ?? image
            UIGraphicsEndImageContext()
        }
        guard let data = output.jpegData(compressionQuality: quality) else { return nil }
        return "data:image/jpeg;base64," + data.base64EncodedString()
    }
}
