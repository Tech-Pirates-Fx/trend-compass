import asyncio
import httpx
from api.app.main import app
from api.app.data_control import DEFAULTS, read_state, state_path

def request(method, path, body=None, client='127.0.0.1', origin='http://localhost:3103', admin=True):
    async def run():
        transport = httpx.ASGITransport(app=app, client=(client, 1234))
        async with httpx.AsyncClient(transport=transport, base_url='http://localhost') as session:
            headers = {'origin': origin}
            if admin:
                headers['x-tc-admin'] = 'test-local-token'
            return await session.request(method, path, json=body, headers=headers)
    return asyncio.run(run())

def test_master_switch_blocks_catalog_analysis_timeseries_and_saved():
    assert request('PUT', '/data-management', {**DEFAULTS, 'enabled': False}).status_code == 200
    assert read_state()['enabled'] is False
    assert request('GET', '/catalog').json() == []
    payload = dict(variable_id='air_temperature', bbox=dict(south=10, north=15, west=20, east=25), start='2005-01', end='2020-12')
    assert request('POST', '/analyze', payload).status_code == 503
    assert request('POST', '/timeseries?variable_id=air_temperature', payload['bbox']).status_code == 503
    assert request('GET', '/saved-voyages').status_code == 503
    assert request('PUT', '/data-management', DEFAULTS).status_code == 200
    assert request('GET', '/catalog').json()
    assert request('GET', '/saved-voyages').status_code == 200

def test_sources_are_independent():
    assert request('PUT','/data-management',{**DEFAULTS,'gistemp':False}).status_code == 200
    assert request('GET','/catalog').json() == []
    assert request('GET','/saved-voyages').status_code == 200
    assert request('PUT','/data-management',{**DEFAULTS,'saved_voyages':False,'nasa_imagery':False}).status_code == 200
    assert request('GET','/catalog').json()
    assert request('GET','/saved-voyages').status_code == 503

def test_remote_and_cross_origin_changes_are_denied():
    off = {**DEFAULTS,'enabled':False}
    assert request('PUT','/data-management',off,client='203.0.113.1').status_code == 403
    assert request('PUT','/data-management',off,origin='https://untrusted.example').status_code == 403
    assert request('PUT','/data-management',off,admin=False).status_code == 403
    assert read_state() == DEFAULTS

def test_settings_are_strict_and_corrupt_state_fails_closed():
    assert request('PUT','/data-management',{**DEFAULTS,'enabled':'false'}).status_code == 422
    assert request('PUT','/data-management',{**DEFAULTS,'unknown':True}).status_code == 422
    state_path().write_text('corrupted',encoding='utf-8')
    assert not any(read_state().values())
    assert request('GET','/saved-voyages').status_code == 503

def test_inventory_does_not_list_credentials():
    result=request('GET','/data-management').json()
    assert result['admin_scope']=='local workstation only'
    assert all(not item['name'].startswith('.env') for item in result['files'])
