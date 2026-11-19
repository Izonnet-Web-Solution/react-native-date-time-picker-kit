import Foundation
import UIKit

@objc(DateTimePickerKitImpl)
public class DateTimePickerKitImpl: NSObject {

  @objc public static let shared = DateTimePickerKitImpl()

  private var isPickerOpen: Bool = false
  private var activeViewController: UIViewController?
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

      // Display style
      let display = options["display"] as? String ?? "default"
      switch display {
      case "spinner":
        picker.preferredDatePickerStyle = .wheels
      case "compact":
        picker.preferredDatePickerStyle = .compact
      case "inline":
        picker.preferredDatePickerStyle = .inline
      default:
        if mode == .dateAndTime {
          picker.preferredDatePickerStyle = .compact
        } else if mode == .date {
          picker.preferredDatePickerStyle = .inline
        } else {
          picker.preferredDatePickerStyle = .wheels
        }
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

      // Theme
      let modalVC = UIViewController()
      modalVC.modalPresentationStyle = .overFullScreen
      modalVC.modalTransitionStyle = .crossDissolve

      if let theme = options["theme"] as? String {
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
      if let accentHex = options["accentColor"] as? String, let color = self.colorFromHex(accentHex) {
        picker.tintColor = color
      }

      self.activePicker = picker

      // Container View
      let overlayView = UIView()
      overlayView.backgroundColor = UIColor.black.withAlphaComponent(0.4)
      overlayView.translatesAutoresizingMaskIntoConstraints = false

      let sheetView = UIView()
      sheetView.backgroundColor = UIColor { trait in
        trait.userInterfaceStyle == .dark ? UIColor(white: 0.15, alpha: 1.0) : UIColor.white
      }
      sheetView.layer.cornerRadius = 16
      sheetView.layer.masksToBounds = true
      sheetView.translatesAutoresizingMaskIntoConstraints = false
      sheetView.accessibilityViewIsModal = true

      // Header Bar
      let headerView = UIView()
      headerView.translatesAutoresizingMaskIntoConstraints = false

      let cancelBtn = UIButton(type: .system)
      let cancelText = options["cancelText"] as? String ?? "Cancel"
      cancelBtn.setTitle(cancelText, for: .normal)
      cancelBtn.accessibilityLabel = cancelText
      cancelBtn.accessibilityTraits = .button
      cancelBtn.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .regular)
      cancelBtn.translatesAutoresizingMaskIntoConstraints = false
      cancelBtn.addTarget(self, action: #selector(self.handleCancelTap), for: .touchUpInside)

      let titleLabel = UILabel()
      let titleText = options["title"] as? String ?? ""
      titleLabel.text = titleText
      titleLabel.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
      titleLabel.textAlignment = .center
      titleLabel.translatesAutoresizingMaskIntoConstraints = false

      let confirmBtn = UIButton(type: .system)
      let confirmText = options["confirmText"] as? String ?? "Confirm"
      confirmBtn.setTitle(confirmText, for: .normal)
      confirmBtn.accessibilityLabel = confirmText
      confirmBtn.accessibilityTraits = .button
      confirmBtn.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
      confirmBtn.translatesAutoresizingMaskIntoConstraints = false
      confirmBtn.addTarget(self, action: #selector(self.handleConfirmTap), for: .touchUpInside)

      headerView.addSubview(cancelBtn)
      headerView.addSubview(titleLabel)
      headerView.addSubview(confirmBtn)

      sheetView.addSubview(headerView)
      sheetView.addSubview(picker)

      modalVC.view.addSubview(overlayView)
      modalVC.view.addSubview(sheetView)

      // Backdrop tap gesture
      let tapGesture = UITapGestureRecognizer(target: self, action: #selector(self.handleBackdropTap))
      overlayView.addGestureRecognizer(tapGesture)

      NSLayoutConstraint.activate([
        overlayView.leadingAnchor.constraint(equalTo: modalVC.view.leadingAnchor),
        overlayView.trailingAnchor.constraint(equalTo: modalVC.view.trailingAnchor),
        overlayView.topAnchor.constraint(equalTo: modalVC.view.topAnchor),
        overlayView.bottomAnchor.constraint(equalTo: modalVC.view.bottomAnchor),

        sheetView.leadingAnchor.constraint(equalTo: modalVC.view.safeAreaLayoutGuide.leadingAnchor, constant: 16),
        sheetView.trailingAnchor.constraint(equalTo: modalVC.view.safeAreaLayoutGuide.trailingAnchor, constant: -16),
        sheetView.bottomAnchor.constraint(equalTo: modalVC.view.safeAreaLayoutGuide.bottomAnchor, constant: -16),

        headerView.leadingAnchor.constraint(equalTo: sheetView.leadingAnchor, constant: 16),
        headerView.trailingAnchor.constraint(equalTo: sheetView.trailingAnchor, constant: -16),
        headerView.topAnchor.constraint(equalTo: sheetView.topAnchor, constant: 12),
        headerView.heightAnchor.constraint(equalToConstant: 44),

        cancelBtn.leadingAnchor.constraint(equalTo: headerView.leadingAnchor),
        cancelBtn.centerYAnchor.constraint(equalTo: headerView.centerYAnchor),

        titleLabel.centerXAnchor.constraint(equalTo: headerView.centerXAnchor),
        titleLabel.centerYAnchor.constraint(equalTo: headerView.centerYAnchor),
        titleLabel.leadingAnchor.constraint(greaterThanOrEqualTo: cancelBtn.trailingAnchor, constant: 8),
        titleLabel.trailingAnchor.constraint(lessThanOrEqualTo: confirmBtn.leadingAnchor, constant: -8),

        confirmBtn.trailingAnchor.constraint(equalTo: headerView.trailingAnchor),
        confirmBtn.centerYAnchor.constraint(equalTo: headerView.centerYAnchor),

        picker.topAnchor.constraint(equalTo: headerView.bottomAnchor, constant: 12),
        picker.leadingAnchor.constraint(equalTo: sheetView.leadingAnchor, constant: 16),
        picker.trailingAnchor.constraint(equalTo: sheetView.trailingAnchor, constant: -16),
        picker.bottomAnchor.constraint(equalTo: sheetView.bottomAnchor, constant: -16),
      ])

      self.activeViewController = modalVC
      topVC.present(modalVC, animated: true, completion: nil)
    }
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
    activeViewController = nil
    activePicker = nil
    isPickerOpen = false
    activeResolve = nil
    activeReject = nil

    if let presenting = vc?.presentingViewController {
      presenting.dismiss(animated: true, completion: completion)
    } else {
      vc?.dismiss(animated: true, completion: completion)
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
