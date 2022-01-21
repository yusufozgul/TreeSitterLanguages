import Foundation

public enum Query {
{{SOURCE}}
}

private extension Query {
    static func url(named filename: String) -> URL {
        return Bundle.module.url(forResource: "queries/" + filename, withExtension: "scm")!
    }
}
