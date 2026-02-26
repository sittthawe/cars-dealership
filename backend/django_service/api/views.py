import json

import requests
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods


JSON_HEADERS = {'Content-Type': 'application/json'}


def _parse_json_body(request):
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}


def _call_node(method, path, payload=None, params=None):
    url = f"{settings.NODE_API_BASE}{path}"
    try:
        response = requests.request(
            method=method,
            url=url,
            params=params,
            json=payload,
            timeout=10,
            headers=JSON_HEADERS,
        )
    except requests.RequestException as exc:
        return None, 502, f'Node API unavailable: {exc}'

    if 'application/json' in response.headers.get('Content-Type', ''):
        body = response.json()
    else:
        body = {'message': response.text}

    return body, response.status_code, None


def _analyze_sentiment(text):
    try:
        response = requests.post(
            f"{settings.SENTIMENT_API_BASE}/analyze",
            json={'text': text},
            timeout=5,
            headers=JSON_HEADERS,
        )
        if response.ok:
            return response.json().get('sentiment', 'neutral')
    except requests.RequestException:
        pass
    return 'neutral'


@require_GET
def health(_request):
    return JsonResponse({'status': 'ok'})


@csrf_exempt
@require_http_methods(['POST'])
def register_user(request):
    payload = _parse_json_body(request)
    username = payload.get('username', '').strip()
    password = payload.get('password', '').strip()
    email = payload.get('email', '').strip()

    if not username or not password:
        return JsonResponse({'error': 'username and password are required'}, status=400)

    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        login(request, user)
    except IntegrityError:
        return JsonResponse({'error': 'username already exists'}, status=409)

    return JsonResponse({'username': user.username, 'authenticated': True}, status=201)


@csrf_exempt
@require_http_methods(['POST'])
def login_user(request):
    payload = _parse_json_body(request)
    username = payload.get('username', '').strip()
    password = payload.get('password', '').strip()

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'error': 'invalid credentials'}, status=401)

    login(request, user)
    return JsonResponse({'username': user.username, 'authenticated': True})


@csrf_exempt
@require_http_methods(['POST'])
def logout_user(request):
    auth_logout(request)
    return JsonResponse({'authenticated': False})


@require_GET
def current_user(request):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'username': request.user.username})
    return JsonResponse({'authenticated': False, 'username': None})


@require_GET
def list_dealers(request):
    state = request.GET.get('state')
    params = {'state': state} if state else None
    body, status, error = _call_node('GET', '/dealers', params=params)
    if error:
        return JsonResponse({'error': error}, status=502)
    return JsonResponse(body, status=status)


@require_GET
def list_cars(request):
    params = {}
    dealer_id = request.GET.get('dealer_id')
    make = request.GET.get('make')

    if dealer_id:
        params['dealer_id'] = dealer_id
    if make:
        params['make'] = make

    body, status, error = _call_node('GET', '/cars', params=params or None)
    if error:
        return JsonResponse({'error': error}, status=502)
    return JsonResponse(body, status=status)


@require_GET
def dealer_detail(_request, dealer_id):
    body, status, error = _call_node('GET', f'/dealers/{dealer_id}')
    if error:
        return JsonResponse({'error': error}, status=502)
    return JsonResponse(body, status=status)


@require_GET
def list_dealer_reviews(_request, dealer_id):
    body, status, error = _call_node('GET', f'/dealers/{dealer_id}/reviews')
    if error:
        return JsonResponse({'error': error}, status=502)
    return JsonResponse(body, status=status)


@csrf_exempt
@require_http_methods(['POST'])
def create_review(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'authentication required'}, status=401)

    payload = _parse_json_body(request)
    review_text = payload.get('review', '').strip()
    dealer_id = payload.get('dealer_id')

    if not review_text or dealer_id is None:
        return JsonResponse({'error': 'dealer_id and review are required'}, status=400)

    try:
        dealer_id = int(dealer_id)
    except (TypeError, ValueError):
        return JsonResponse({'error': 'dealer_id must be an integer'}, status=400)

    review_payload = {
        'dealer_id': dealer_id,
        'name': request.user.username,
        'review': review_text,
        'purchase_date': payload.get('purchase_date'),
        'car_make': payload.get('car_make'),
        'car_model': payload.get('car_model'),
        'car_year': payload.get('car_year'),
        'sentiment': _analyze_sentiment(review_text),
    }

    body, status, error = _call_node('POST', '/reviews', payload=review_payload)
    if error:
        return JsonResponse({'error': error}, status=502)

    return JsonResponse(body, status=status)
