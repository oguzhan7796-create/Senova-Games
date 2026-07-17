import UIKit
import GameKit

final class GameCenterManager: NSObject {
    static let shared = GameCenterManager()

    private let pendingScoresKey = "bm.gc.pendingScores"
    private weak var host: UIViewController?
    private var statusHandler: ((String) -> Void)?
    private var authStarted = false
    private var presentingDashboard = false

    private let leaderboardByMod: [String: String] = [
        "classic8": "com.blockmir.game.classic8",
        "classic10": "com.blockmir.game.classic10",
        "blitz": "com.blockmir.game.daily.blitz",
        "single": "com.blockmir.game.daily.single",
        "lockboard": "com.blockmir.game.daily.lockboard",
        "night": "com.blockmir.game.daily.night",
        "mirror": "com.blockmir.game.daily.mirror",
        "shrink": "com.blockmir.game.daily.shrink",
        "nightmirror": "com.blockmir.game.daily.nightmirror",
    ]

    func configure(host: UIViewController, statusHandler: @escaping (String) -> Void) {
        self.host = host
        self.statusHandler = statusHandler
        startAuthenticationIfNeeded()
    }

    func submitScore(mod: String, score: Int) {
        let value = max(0, score)
        guard let leaderboardID = leaderboardID(for: mod) else {
            notify("unknown_leaderboard")
            return
        }
        guard value > 0 else { return }

        if !GKLocalPlayer.local.isAuthenticated {
            queuePending(leaderboardID: leaderboardID, score: value)
            startAuthenticationIfNeeded()
            return
        }

        Task { @MainActor in
            do {
                try await GKLeaderboard.submitScore(
                    value,
                    context: 0,
                    player: GKLocalPlayer.local,
                    leaderboardIDs: [leaderboardID]
                )
            } catch {
                queuePending(leaderboardID: leaderboardID, score: value)
            }
        }
    }

    func showLeaderboard(mod: String) {
        guard let leaderboardID = leaderboardID(for: mod) else {
            notify("unknown_leaderboard")
            return
        }
        guard let host else {
            notify("leaderboard_failed")
            return
        }
        guard GKLocalPlayer.local.isAuthenticated else {
            startAuthenticationIfNeeded()
            notify("sign_in_failed")
            return
        }
        guard !presentingDashboard else { return }

        let vc = GKGameCenterViewController(
            leaderboardID: leaderboardID,
            playerScope: .global,
            timeScope: .allTime
        )
        vc.gameCenterDelegate = self
        presentingDashboard = true
        host.present(vc, animated: true)
    }

    private func leaderboardID(for mod: String) -> String? {
        let key = mod.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return leaderboardByMod[key]
    }

    private func startAuthenticationIfNeeded() {
        if authStarted { return }
        authStarted = true

        GKLocalPlayer.local.authenticateHandler = { [weak self] viewController, error in
            guard let self else { return }
            if let viewController, let host = self.host {
                host.present(viewController, animated: true)
                return
            }
            if error != nil || !GKLocalPlayer.local.isAuthenticated {
                self.notify("sign_in_failed")
                return
            }
            self.notify("signed_in")
            self.flushPendingScores()
        }
    }

    private func flushPendingScores() {
        let pending = loadPending()
        guard !pending.isEmpty, GKLocalPlayer.local.isAuthenticated else { return }
        clearPending()

        Task { @MainActor in
            var leftover: [String: Int] = [:]
            for (leaderboardID, score) in pending {
                do {
                    try await GKLeaderboard.submitScore(
                        score,
                        context: 0,
                        player: GKLocalPlayer.local,
                        leaderboardIDs: [leaderboardID]
                    )
                } catch {
                    leftover[leaderboardID] = max(leftover[leaderboardID] ?? 0, score)
                }
            }
            if !leftover.isEmpty {
                savePending(leftover)
            }
        }
    }

    private func queuePending(leaderboardID: String, score: Int) {
        var pending = loadPending()
        pending[leaderboardID] = max(pending[leaderboardID] ?? 0, score)
        savePending(pending)
    }

    private func loadPending() -> [String: Int] {
        (UserDefaults.standard.dictionary(forKey: pendingScoresKey) as? [String: Int]) ?? [:]
    }

    private func savePending(_ value: [String: Int]) {
        UserDefaults.standard.set(value, forKey: pendingScoresKey)
    }

    private func clearPending() {
        UserDefaults.standard.removeObject(forKey: pendingScoresKey)
    }

    private func notify(_ status: String) {
        DispatchQueue.main.async { [weak self] in
            self?.statusHandler?(status)
        }
    }
}

extension GameCenterManager: GKGameCenterControllerDelegate {
    func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        presentingDashboard = false
        gameCenterViewController.dismiss(animated: true)
    }
}
