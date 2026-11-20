import Foundation
import UIKit

@objc(DateTimePickerKitImpl)
public class DateTimePickerKitImpl: NSObject {

  @objc public static let shared = DateTimePickerKitImpl()

  private var isPickerOpen: Bool = false
  private var activeViewController: UIViewController?
  private var activeContainerView: UIView?
  private var activePicker: UIDatePicker?
  private var storedTimestamp: Double = Date().timeIntervalSince1970 * 1000
  private var activeResolve: ((Any?) -> Void)?
  private var activeReject: ((String, String, Error?) -> Void)?

  private override init() {
    super.init()
  }

  @objc(openDatePickerWithOptions:resolve:reject:)
  public func openDatePicker(
    options: [String: Any],
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    presentPicker(mode: .date, options: options, resolve: resolve, reject: reject)
  }

  @objc(openTimePickerWithOptions:resolve:reject:)
  public func openTimePicker(
    options: [String: Any],
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    presentPicker(mode: .time, options: options, resolve: resolve, reject: reject)
  }

  @objc(openDateTimePickerWithOptions:resolve:reject:)
  public func openDateTimePicker(
    options: [String: Any],
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    presentPicker(mode: .dateAndTime, options: options, resolve: resolve, reject: reject)
  }

  @objc(openCountdownPickerWithOptions:resolve:reject:)
  public func openCountdownPicker(
    options: [String: Any],
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    presentPicker(mode: .countDownTimer, options: options, resolve: resolve, reject: reject)
  }

  @objc(closePickerWithResolve:reject:)
  public func closePicker(
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      if !self.isPickerOpen || self.activeViewController == nil {
        resolve(false)
        return
      }

      let openResolve = self.activeResolve
      let ts = self.storedTimestamp
      self.cleanupAndDismiss(action: "dismissed") {
        openResolve?([
          "action": "dismissed",
          "timestamp": ts
        ])
      }
      resolve(true)
    }
  }

  @objc(confirmPickerWithResolve:reject:)
  public func confirmPicker(
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      guard self.isPickerOpen, let picker = self.activePicker else {
        reject("PICKER_NOT_OPEN", "Picker is not currently open.", nil)
        return
      }

      let timestamp = picker.date.timeIntervalSince1970 * 1000
      self.storedTimestamp = timestamp
      let openResolve = self.activeResolve

      self.cleanupAndDismiss(action: "confirmed") {
        openResolve?([
          "action": "confirmed",
          "timestamp": timestamp
        ])
      }

      resolve([
        "action": "confirmed",
        "timestamp": timestamp
      ])
    }
  }

  @objc(cancelPickerWithResolve:reject:)
  public func cancelPicker(
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      guard self.isPickerOpen else {
        reject("PICKER_NOT_OPEN", "Picker is not currently open.", nil)
        return
      }

      let openResolve = self.activeResolve
      let ts = self.storedTimestamp
      self.cleanupAndDismiss(action: "cancelled") {
        openResolve?([
          "action": "cancelled",
          "timestamp": ts
        ])
      }
      resolve(true)
    }
  }

  @objc(setSelectedDate:resolve:reject:)
  public func setSelectedDate(
    timestamp: Double,
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      self.storedTimestamp = timestamp
      let date = Date(timeIntervalSince1970: timestamp / 1000)
      self.activePicker?.setDate(date, animated: true)
      resolve(true)
    }
  }

  @objc(getSelectedDateWithResolve:reject:)
  public func getSelectedDate(
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      let timestamp = self.activePicker?.date.timeIntervalSince1970.advanced(by: 0) ?? (self.storedTimestamp / 1000)
      resolve([
        "action": "confirmed",
        "timestamp": timestamp * 1000
      ])
    }
  }

  @objc(resetPickerWithResolve:reject:)
  public func resetPicker(
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      self.storedTimestamp = Date().timeIntervalSince1970 * 1000
      let now = Date()
      self.activePicker?.setDate(now, animated: true)
      resolve(true)
    }
  }

  // MARK: - Presentation Implementation

  private func presentPicker(
    mode: UIDatePicker.Mode,
    options: [String: Any],
    resolve: @escaping (Any?) -> Void,
    reject: @escaping (String, String, Error?) -> Void
  ) {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }

      if self.isPickerOpen {
        reject("PICKER_ALREADY_OPEN", "A date time picker is already open.", nil)
        return
      }

      guard let topVC = self.getTopViewController() else {
        reject("PRESENTATION_FAILED", "Could not find a presenting view controller.", nil)
        return
      }

      self.isPickerOpen = true
      self.activeResolve = resolve
      self.activeReject = reject

      let initialMs = options["value"] as? Double ?? (Date().timeIntervalSince1970 * 1000)
      self.storedTimestamp = initialMs
      let initialDate = Date(timeIntervalSince1970: initialMs / 1000)

      let picker = UIDatePicker()
      picker.datePickerMode = mode
      picker.date = initialDate
      picker.translatesAutoresizingMaskIntoConstraints = false

      // Display style - default to wheels (spinner) to match react-native-modal-datetime-picker ActionSheet UI
      let display = options["display"] as? String ?? "default"
      switch display {
      case "spinner":
        picker.preferredDatePickerStyle = .wheels
      case "compact":
        picker.preferredDatePickerStyle = .compact
      case "inline":
        picker.preferredDatePickerStyle = .inline
      default:
        picker.preferredDatePickerStyle = .wheels
      }

      // Minimum Date
      if let minMs = options["minimumDate"] as? Double {
        picker.minimumDate = Date(timeIntervalSince1970: minMs / 1000)
      }

      // Maximum Date
      if let maxMs = options["maximumDate"] as? Double {
        picker.maximumDate = Date(timeIntervalSince1970: maxMs / 1000)
      }

      // Minute Interval
      if let interval = options["minuteInterval"] as? Int, interval >= 1 && interval <= 30 {
        picker.minuteInterval = interval
      }

      // Locale
      if let localeStr = options["locale"] as? String, !localeStr.isEmpty {
        picker.locale = Locale(identifier: localeStr)
      } else {
        picker.locale = Locale.current
      }

      // TimeZone
      if let offsetMinutes = options["timeZoneOffsetInMinutes"] as? Int {
        if let tz = TimeZone(secondsFromGMT: offsetMinutes * 60) {
          picker.timeZone = tz
        }
      }

      // Theme & Dark Mode
      let modalVC = UIViewController()
      modalVC.modalPresentationStyle = .overFullScreen
      modalVC.modalTransitionStyle = .crossDissolve

      if let isDark = options["isDarkModeEnabled"] as? Bool {
        modalVC.overrideUserInterfaceStyle = isDark ? .dark : .light
      } else if let theme = options["theme"] as? String {
        switch theme {
        case "dark":
          modalVC.overrideUserInterfaceStyle = .dark
        case "light":
          modalVC.overrideUserInterfaceStyle = .light
        default:
          modalVC.overrideUserInterfaceStyle = .unspecified
        }
      }

      // Accent color
      let accentHex = options["accentColorIOS"] as? String ?? options["accentColor"] as? String
      if let accHex = accentHex, let color = self.colorFromHex(accHex) {
        picker.tintColor = color
      }

      // Accessibility
      if let accLabel = options["accessibilityLabel"] as? String {
        picker.accessibilityLabel = accLabel
      }
      if let accHint = options["accessibilityHint"] as? String {
        picker.accessibilityHint = accHint
      }

      picker.addTarget(self, action: #selector(self.handlePickerDateChanged(_:)), for: .valueChanged)
      self.activePicker = picker

      // Overlay Backdrop View (dimmed background)
      let overlayView = UIView()
      overlayView.backgroundColor = UIColor.black.withAlphaComponent(0.4)
      overlayView.translatesAutoresizingMaskIntoConstraints = false

      let tapGesture = UITapGestureRecognizer(target: self, action: #selector(self.handleBackdropTap))
      overlayView.addGestureRecognizer(tapGesture)

      // Container View for both cards
      let containerView = UIView()
      containerView.translatesAutoresizingMaskIntoConstraints = false
      containerView.backgroundColor = .clear
      self.activeContainerView = containerView

      // Card Background Color
      let cardBgColor: UIColor
      if let bgHex = options["backgroundColor"] as? String, let customBg = self.colorFromHex(bgHex) {
        cardBgColor = customBg
      } else {
        cardBgColor = UIColor { trait in
          trait.userInterfaceStyle == .dark
            ? UIColor(red: 0.17, green: 0.17, blue: 0.18, alpha: 0.98)
            : UIColor(red: 0.98, green: 0.98, blue: 0.98, alpha: 0.98)
        }
      }

      // Top Card (Picker + Separator + Confirm Button)
      let topCard = UIView()
      topCard.layer.cornerRadius = 14
      topCard.layer.masksToBounds = true
      topCard.backgroundColor = cardBgColor
      topCard.translatesAutoresizingMaskIntoConstraints = false

      // Hairline Separator
      let separator = UIView()
      separator.backgroundColor = UIColor.separator
      separator.translatesAutoresizingMaskIntoConstraints = false

      // Button Colors
      let defaultBlue = UIColor(red: 0.0, green: 122.0 / 255.0, blue: 1.0, alpha: 1.0)
      let btnTextColor = (options["buttonTextColorIOS"] as? String ?? options["buttonTextColor"] as? String).flatMap { self.colorFromHex($0) }
      let accentCol = (options["accentColorIOS"] as? String ?? options["accentColor"] as? String).flatMap { self.colorFromHex($0) }

      let confirmColor = (options["confirmButtonTextColorIOS"] as? String).flatMap { self.colorFromHex($0) }
        ?? btnTextColor
        ?? accentCol
        ?? defaultBlue

      let cancelColor = (options["cancelButtonTextColorIOS"] as? String).flatMap { self.colorFromHex($0) }
        ?? btnTextColor
        ?? accentCol
        ?? defaultBlue

      // Confirm Button
      let confirmBtn = UIButton(type: .system)
      let confirmText = options["confirmTextIOS"] as? String ?? options["confirmText"] as? String ?? "Confirm"
      confirmBtn.setTitle(confirmText, for: .normal)
      confirmBtn.accessibilityLabel = confirmText
      confirmBtn.accessibilityTraits = .button
      confirmBtn.titleLabel?.font = UIFont.systemFont(ofSize: 20, weight: .regular)
      confirmBtn.setTitleColor(confirmColor, for: .normal)
      confirmBtn.translatesAutoresizingMaskIntoConstraints = false
      confirmBtn.addTarget(self, action: #selector(self.handleConfirmTap), for: .touchUpInside)

      // Optional Title Label
      let titleText = options["title"] as? String
      var titleLabel: UILabel?
      var titleSeparator: UIView?
      if let tText = titleText, !tText.isEmpty {
        let label = UILabel()
        label.text = tText
        label.font = UIFont.systemFont(ofSize: 13, weight: .regular)
        label.textColor = UIColor.secondaryLabel
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        topCard.addSubview(label)
        titleLabel = label

        let tSep = UIView()
        tSep.backgroundColor = UIColor.separator
        tSep.translatesAutoresizingMaskIntoConstraints = false
        topCard.addSubview(tSep)
        titleSeparator = tSep
      }

      topCard.addSubview(picker)
      topCard.addSubview(separator)
      topCard.addSubview(confirmBtn)

      // Bottom Card (Cancel Button)
      let bottomCard = UIView()
      bottomCard.layer.cornerRadius = 14
      bottomCard.layer.masksToBounds = true
      bottomCard.backgroundColor = cardBgColor
      bottomCard.translatesAutoresizingMaskIntoConstraints = false

      let cancelBtn = UIButton(type: .system)
      let cancelText = options["cancelTextIOS"] as? String ?? options["cancelText"] as? String ?? "Cancel"
      cancelBtn.setTitle(cancelText, for: .normal)
      cancelBtn.accessibilityLabel = cancelText
      cancelBtn.accessibilityTraits = .button
      cancelBtn.titleLabel?.font = UIFont.systemFont(ofSize: 20, weight: .semibold)
      cancelBtn.setTitleColor(cancelColor, for: .normal)
      cancelBtn.translatesAutoresizingMaskIntoConstraints = false
      cancelBtn.addTarget(self, action: #selector(self.handleCancelTap), for: .touchUpInside)

      bottomCard.addSubview(cancelBtn)

      containerView.addSubview(topCard)
      containerView.addSubview(bottomCard)

      modalVC.view.addSubview(overlayView)
      modalVC.view.addSubview(containerView)

      // Layout Constraints
      var constraints: [NSLayoutConstraint] = [
        overlayView.leadingAnchor.constraint(equalTo: modalVC.view.leadingAnchor),
        overlayView.trailingAnchor.constraint(equalTo: modalVC.view.trailingAnchor),
        overlayView.topAnchor.constraint(equalTo: modalVC.view.topAnchor),
        overlayView.bottomAnchor.constraint(equalTo: modalVC.view.bottomAnchor),

        containerView.leadingAnchor.constraint(equalTo: modalVC.view.safeAreaLayoutGuide.leadingAnchor, constant: 10),
        containerView.trailingAnchor.constraint(equalTo: modalVC.view.safeAreaLayoutGuide.trailingAnchor, constant: -10),
        containerView.bottomAnchor.constraint(equalTo: modalVC.view.safeAreaLayoutGuide.bottomAnchor, constant: -10),

        topCard.topAnchor.constraint(equalTo: containerView.topAnchor),
        topCard.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
        topCard.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),

        bottomCard.topAnchor.constraint(equalTo: topCard.bottomAnchor, constant: 8),
        bottomCard.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
        bottomCard.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
        bottomCard.bottomAnchor.constraint(equalTo: containerView.bottomAnchor),
        bottomCard.heightAnchor.constraint(equalToConstant: 57),

        cancelBtn.topAnchor.constraint(equalTo: bottomCard.topAnchor),
        cancelBtn.bottomAnchor.constraint(equalTo: bottomCard.bottomAnchor),
        cancelBtn.leadingAnchor.constraint(equalTo: bottomCard.leadingAnchor),
        cancelBtn.trailingAnchor.constraint(equalTo: bottomCard.trailingAnchor),

        separator.leadingAnchor.constraint(equalTo: topCard.leadingAnchor),
        separator.trailingAnchor.constraint(equalTo: topCard.trailingAnchor),
        separator.heightAnchor.constraint(equalToConstant: 0.5),

        confirmBtn.topAnchor.constraint(equalTo: separator.bottomAnchor),
        confirmBtn.leadingAnchor.constraint(equalTo: topCard.leadingAnchor),
        confirmBtn.trailingAnchor.constraint(equalTo: topCard.trailingAnchor),
        confirmBtn.heightAnchor.constraint(equalToConstant: 57),
        confirmBtn.bottomAnchor.constraint(equalTo: topCard.bottomAnchor),
      ]

      if let tLabel = titleLabel, let tSep = titleSeparator {
        constraints.append(contentsOf: [
          tLabel.topAnchor.constraint(equalTo: topCard.topAnchor, constant: 12),
          tLabel.leadingAnchor.constraint(equalTo: topCard.leadingAnchor, constant: 16),
          tLabel.trailingAnchor.constraint(equalTo: topCard.trailingAnchor, constant: -16),

          tSep.topAnchor.constraint(equalTo: tLabel.bottomAnchor, constant: 12),
          tSep.leadingAnchor.constraint(equalTo: topCard.leadingAnchor),
          tSep.trailingAnchor.constraint(equalTo: topCard.trailingAnchor),
          tSep.heightAnchor.constraint(equalToConstant: 0.5),

          picker.topAnchor.constraint(equalTo: tSep.bottomAnchor),
        ])
      } else {
        constraints.append(picker.topAnchor.constraint(equalTo: topCard.topAnchor))
      }

      constraints.append(contentsOf: [
        picker.leadingAnchor.constraint(equalTo: topCard.leadingAnchor),
        picker.trailingAnchor.constraint(equalTo: topCard.trailingAnchor),
        picker.bottomAnchor.constraint(equalTo: separator.topAnchor),
      ])

      NSLayoutConstraint.activate(constraints)

      // Start offscreen for slide-up animation
      containerView.transform = CGAffineTransform(translationX: 0, y: 400)

      self.activeViewController = modalVC
      topVC.present(modalVC, animated: true) {
        UIView.animate(withDuration: 0.28, delay: 0, options: [.curveEaseOut], animations: {
          containerView.transform = .identity
        }, completion: nil)
      }
    }
  }

  @objc private func handlePickerDateChanged(_ sender: UIDatePicker) {
    storedTimestamp = sender.date.timeIntervalSince1970 * 1000
  }

  @objc private func handleConfirmTap() {
    guard let picker = activePicker else { return }
    let timestamp = picker.date.timeIntervalSince1970 * 1000
    storedTimestamp = timestamp
    let resolve = activeResolve
    cleanupAndDismiss(action: "confirmed") {
      resolve?([
        "action": "confirmed",
        "timestamp": timestamp
      ])
    }
  }

  @objc private func handleCancelTap() {
    let resolve = activeResolve
    let ts = storedTimestamp
    cleanupAndDismiss(action: "cancelled") {
      resolve?([
        "action": "cancelled",
        "timestamp": ts
      ])
    }
  }

  @objc private func handleBackdropTap() {
    let resolve = activeResolve
    let ts = storedTimestamp
    cleanupAndDismiss(action: "dismissed") {
      resolve?([
        "action": "dismissed",
        "timestamp": ts
      ])
    }
  }

  private func cleanupAndDismiss(action: String, completion: (() -> Void)? = nil) {
    let vc = activeViewController
    let container = activeContainerView

    activeViewController = nil
    activeContainerView = nil
    activePicker = nil
    isPickerOpen = false
    activeResolve = nil
    activeReject = nil

    let finishDismiss = {
      if let presenting = vc?.presentingViewController {
        presenting.dismiss(animated: true, completion: completion)
      } else {
        vc?.dismiss(animated: true, completion: completion)
      }
    }

    if let containerView = container {
      UIView.animate(withDuration: 0.2, delay: 0, options: [.curveEaseIn], animations: {
        containerView.transform = CGAffineTransform(translationX: 0, y: 400)
      }) { _ in
        finishDismiss()
      }
    } else {
      finishDismiss()
    }
  }

  private func getTopViewController(base: UIViewController? = nil) -> UIViewController? {
    let currentBase = base ?? UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first { $0.isKeyWindow }?
      .rootViewController

    if let nav = currentBase as? UINavigationController {
      return getTopViewController(base: nav.visibleViewController)
    }
    if let tab = currentBase as? UITabBarController {
      if let selected = tab.selectedViewController {
        return getTopViewController(base: selected)
      }
    }
    if let presented = currentBase?.presentedViewController {
      return getTopViewController(base: presented)
    }
    return currentBase
  }

  private func colorFromHex(_ hex: String) -> UIColor? {
    var cString = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
    if cString.hasPrefix("#") {
      cString.remove(at: cString.startIndex)
    }
    guard cString.count == 6 || cString.count == 8 else { return nil }

    var rgbValue: UInt64 = 0
    Scanner(string: cString).scanHexInt64(&rgbValue)

    if cString.count == 8 {
      return UIColor(
        red: CGFloat((rgbValue & 0xFF000000) >> 24) / 255.0,
        green: CGFloat((rgbValue & 0x00FF0000) >> 16) / 255.0,
        blue: CGFloat((rgbValue & 0x0000FF00) >> 8) / 255.0,
        alpha: CGFloat(rgbValue & 0x000000FF) / 255.0
      )
    } else {
      return UIColor(
        red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
        green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
        blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
        alpha: 1.0
      )
    }
  }
}
