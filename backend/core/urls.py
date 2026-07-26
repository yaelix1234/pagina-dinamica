from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UsuarioViewSet, CategoriaViewSet, ProductoViewSet, ClienteViewSet,
    PedidoViewSet, DetallePedidoViewSet,
    DashboardResumenView, VentasUltimosSieteDiasView,
    ProductosMasVendidosView, ProductosRecientesView, InventarioPorAtenderView,
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'detalle-pedido', DetallePedidoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/resumen/', DashboardResumenView.as_view(), name='dashboard-resumen'),
    path('dashboard/ventas-7-dias/', VentasUltimosSieteDiasView.as_view(), name='dashboard-ventas-7-dias'),
    path('dashboard/productos-mas-vendidos/', ProductosMasVendidosView.as_view(), name='dashboard-mas-vendidos'),
    path('dashboard/productos-recientes/', ProductosRecientesView.as_view(), name='dashboard-recientes'),
    path('dashboard/inventario-bajo/', InventarioPorAtenderView.as_view(), name='dashboard-inventario-bajo'),
]