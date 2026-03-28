import Foundation
import Capacitor
import UIKit

@objc(PremiumHapticsPlugin)
public class PremiumHapticsPlugin: CAPPlugin {
    private var currentProfile: String = "balanced"

    @objc public func isSupported(_ call: CAPPluginCall) {
        call.resolve(["supported": true])
    }

    @objc public func setProfile(_ call: CAPPluginCall) {
        currentProfile = normalizeProfile(call.getString("profile") ?? currentProfile)
        call.resolve()
    }

    @objc public func warmup(_ call: CAPPluginCall) {
        UIImpactFeedbackGenerator(style: .light).prepare()
        call.resolve()
    }

    @objc public func play(_ call: CAPPluginCall) {
        let event = call.getString("event") ?? "button"
        let profile = normalizeProfile(call.getString("profile") ?? currentProfile)

        DispatchQueue.main.async {
            self.performEvent(event: event, profile: profile)
            call.resolve()
        }
    }

    private func normalizeProfile(_ profile: String) -> String {
        switch profile {
        case "subtle", "balanced", "punchy":
            return profile
        default:
            return "balanced"
        }
    }

    private func performEvent(event: String, profile: String) {
        switch event {
        case "selection":
            UISelectionFeedbackGenerator().selectionChanged()
        case "navigation":
            impact(profile == "punchy" ? .medium : .light)
            UISelectionFeedbackGenerator().selectionChanged()
        case "success":
            impact(profile == "subtle" ? .light : .medium)
        case "streak":
            impact(profile == "subtle" ? .light : .medium)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.03) {
                self.impact(.medium)
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.08) {
                self.impact(.heavy)
            }
        case "undo":
            impact(.light)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.02) {
                self.impact(profile == "punchy" ? .medium : .light)
            }
        case "failure", "warning":
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
        case "error":
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        default:
            impact(profile == "punchy" ? .medium : .light)
        }
    }

    private func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.prepare()
        generator.impactOccurred()
    }
}
