import io
import unittest
from contextlib import redirect_stdout
from unittest.mock import Mock, patch

import requests

from website_checker import check_websites, display_statuses


class CheckWebsitesTests(unittest.TestCase):
    @patch("website_checker.requests.get")
    def test_marks_2xx_status_as_up(self, mock_get):
        mock_get.return_value = Mock(status_code=204)

        result = check_websites(["https://example.com"])

        self.assertEqual(result, {"https://example.com": "UP"})
        mock_get.assert_called_once_with("https://example.com", timeout=5)

    @patch("website_checker.requests.get")
    def test_marks_non_2xx_status_as_down(self, mock_get):
        mock_get.return_value = Mock(status_code=404)

        result = check_websites(["https://example.com"])

        self.assertEqual(result, {"https://example.com": "DOWN"})

    @patch("website_checker.requests.get")
    def test_marks_request_exception_as_error(self, mock_get):
        mock_get.side_effect = requests.exceptions.RequestException

        result = check_websites(["https://example.com"])

        self.assertEqual(result, {"https://example.com": "ERROR"})


class DisplayStatusesTests(unittest.TestCase):
    def test_displays_header_and_status_lines(self):
        output = io.StringIO()

        with redirect_stdout(output):
            display_statuses(
                {
                    "https://example.com": "UP",
                    "https://example.org": "ERROR",
                }
            )

        self.assertEqual(
            output.getvalue(),
            "Website Status\n"
            "--------------\n"
            "\n"
            "https://example.com: UP\n"
            "https://example.org: ERROR\n",
        )

    def test_displays_header_for_empty_statuses(self):
        output = io.StringIO()

        with redirect_stdout(output):
            display_statuses({})

        self.assertEqual(
            output.getvalue(),
            "Website Status\n"
            "--------------\n"
            "\n",
        )


if __name__ == "__main__":
    unittest.main()
