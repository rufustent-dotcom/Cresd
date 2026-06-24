import requests

websites = [
    "https://www.google.com",
    "https://www.facebook.com",
    "https://www.twitter.com",
    "https://www.bing.com",
    "https://www.youtube.com",
]


def check_websites(website_list):
    status_dict = {}

    for item in website_list:
        website = item.strip()
        try:
            status = requests.get(website, timeout=5).status_code
            status_dict[website] = "UP" if status == 200 else "DOWN"
        except requests.exceptions.RequestException:
            status_dict[website] = "ERROR"

    print("Website Status")
    print()
    print(status_dict)
    return status_dict


if __name__ == "__main__":
    check_websites(websites)
