import base64
import requests
import json
import os
from PIL import Image
import io

mermaid_code = """erDiagram
    PARROQUIA_MANTA ||--o{ HOTEL : "ubica_en"
    TIPO_HOTEL ||--o{ HOTEL : "clasifica_modalidad"
    CATEGORIA_HOTEL ||--o{ HOTEL : "clasifica_estrellas"

    ROL ||--o{ USUARIO : "asigna_perfil"
    HOTEL ||--o{ USUARIO : "emplea_personal"
    HOTEL ||--o{ BITACORA_AUDITORIA : "registra_hotel"
    USUARIO ||--o{ BITACORA_AUDITORIA : "ejecuta_evento"

    HOTEL ||--o{ TIPO_HABITACION : "comercializa"
    TIPO_HABITACION ||--o{ CUPO_FECHA_TIPO_HABITACION : "asigna_cupos_diarios"

    HOTEL ||--o{ TEMPORADA : "calendariza"
    HOTEL ||--o{ PLAN_TARIFA : "define_planes"
    TIPO_HABITACION ||--o{ TARIFA_TEMPORADA_PLAN : "tarifa_por_tipo"
    TEMPORADA ||--o{ TARIFA_TEMPORADA_PLAN : "tarifa_por_temporada"
    PLAN_TARIFA ||--o{ TARIFA_TEMPORADA_PLAN : "tarifa_por_plan"

    HOTEL ||--o{ RESERVA : "recibe_reserva"
    HUESPED ||--o{ RESERVA : "titular_reserva"
    CANAL_VENTA ||--o{ RESERVA : "captura_canal"

    RESERVA ||--|{ RESERVA_DETALLE_HABITACION : "desglosa_cupos"
    TIPO_HABITACION ||--o{ RESERVA_DETALLE_HABITACION : "tipo_reservado"
    PLAN_TARIFA ||--o{ RESERVA_DETALLE_HABITACION : "plan_contratado"
    RESERVA ||--o{ RESERVA_SERVICIO_ADICIONAL : "agrega_extras"

    RESERVA ||--o{ PAGO : "liquida"
    HOTEL ||--o{ PAGO : "acredita_a"
    METODO_PAGO ||--o{ PAGO : "procesado_con"
    PAGO ||--o{ LINK_PAGO : "genera_token"

    HOTEL ||--o{ COMENTARIO_CALIFICACION : "evalua_hotel"
    HUESPED ||--o{ COMENTARIO_CALIFICACION : "escribe_resena"
    RESERVA ||--o| COMENTARIO_CALIFICACION : "valida_estancia"

    PARROQUIA_MANTA {
        int id_parroquia PK
        string nombre
        string tipo_zona
    }

    HOTEL {
        string id_hotel PK
        int id_parroquia FK
        string razon_social
        string ruc UK
        boolean aplica_servicio_10
        boolean conmutador_iva_8_emergencia
    }

    ROL {
        string id_rol PK
        string nombre
    }

    USUARIO {
        uuid id_usuario PK
        string id_hotel FK
        string id_rol FK
        string email UK
        string password_hash
    }

    BITACORA_AUDITORIA {
        bigint id_auditoria PK
        string id_hotel FK
        uuid id_usuario FK
        string accion
        string tabla_afectada
        timestamp fecha_evento
    }

    TIPO_HABITACION {
        uuid id_tipo_habitacion PK
        string id_hotel FK
        string nombre
        numeric precio_base_estandar
        int capacidad_adultos
    }

    CUPO_FECHA_TIPO_HABITACION {
        bigint id_cupo PK
        uuid id_tipo_habitacion FK
        date fecha
        int cupo_total_disponible
        int cupo_reservado
        boolean venta_cerrada
    }

    TEMPORADA {
        string id_temporada PK
        string id_hotel FK
        string nombre
        numeric multiplicador
    }

    PLAN_TARIFA {
        string id_plan PK
        string id_hotel FK
        string codigo
        string nombre
    }

    TARIFA_TEMPORADA_PLAN {
        uuid id_tarifa PK
        uuid id_tipo_habitacion FK
        string id_temporada FK
        string id_plan FK
        numeric precio_noche_calculado
    }

    HUESPED {
        uuid id_huesped PK
        string numero_documento
        string nombres
        string email UK
        string telefono_whatsapp
        boolean acepta_terminos_legales
        boolean consentimiento_lopdp
    }

    RESERVA {
        string id_reserva PK
        string id_hotel FK
        uuid id_huesped FK
        date fecha_checkin
        date fecha_checkout
        string codigo_voucher_confirmacion UK
        numeric total_reserva_usd
        string estado
    }

    RESERVA_DETALLE_HABITACION {
        uuid id_detalle PK
        string id_reserva FK
        uuid id_tipo_habitacion FK
        string id_plan FK
        int cantidad_habitaciones
        numeric precio_unitario_noche
    }

    PAGO {
        string id_pago PK
        string id_reserva FK
        string id_metodo_pago FK
        numeric monto_usd
        string id_transaccion_pasarela
        string estado
    }

    METODO_PAGO {
        string id_metodo_pago PK
        string codigo
        string nombre
        string tipo_pasarela
    }

    LINK_PAGO {
        string id_link_pago PK
        string id_pago FK
        string token_hash UK
        timestamp fecha_expiracion
        boolean utilizado
    }

    COMENTARIO_CALIFICACION {
        uuid id_comentario PK
        string id_hotel FK
        uuid id_huesped FK
        string id_reserva FK
        int puntuacion_estrellas
        text comentario
        timestamp fecha_publicacion
    }
"""

def generate():
    payload = {
        "code": mermaid_code,
        "mermaid": {
            "theme": "default",
            "themeVariables": {
                "primaryColor": "#f8fafc",
                "primaryTextColor": "#0f172a",
                "primaryBorderColor": "#d97706",
                "lineColor": "#1e3a8a",
                "secondaryColor": "#f1f5f9",
                "tertiaryColor": "#ffffff",
                "fontFamily": "Segoe UI, Arial, sans-serif",
                "fontSize": "14px"
            }
        }
    }
    json_bytes = json.dumps(payload).encode('utf-8')
    encoded = base64.urlsafe_b64encode(json_bytes).decode('ascii')
    
    url = f"https://mermaid.ink/img/{encoded}?width=2200"
    print(f"Requesting full ERD image from mermaid.ink (width=2200)...")
    resp = requests.get(url, timeout=40)
    print("Response status:", resp.status_code, len(resp.content), "bytes")
    
    if resp.status_code == 200:
        # Save as PNG
        img = Image.open(io.BytesIO(resp.content))
        out_path = os.path.abspath("diagrama_base_de_datos_alojamanta.png")
        img.save(out_path, "PNG", optimize=True)
        print(f"Saved PNG image at: {out_path} ({img.size[0]}x{img.size[1]})")

        # Copy to artifacts directory
        artifact_dir = r"C:\Users\leneker\.gemini\antigravity\brain\73380109-92d8-4d42-bec6-1d9e7c113a3d"
        artifact_img_path = os.path.join(artifact_dir, "diagrama_base_de_datos_alojamanta.png")
        img.save(artifact_img_path, "PNG", optimize=True)
        print(f"Saved artifact PNG at: {artifact_img_path}")
    else:
        print("Failed to get image from mermaid.ink:", resp.status_code, resp.text[:200])

if __name__ == "__main__":
    generate()